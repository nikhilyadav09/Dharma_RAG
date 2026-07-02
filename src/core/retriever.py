from typing import List, Dict, Optional
import logging

import psycopg2
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder
import nltk

nltk.download("punkt_tab", quiet=True)
nltk.download("punkt", quiet=True)

from src.config.settings import DatabaseConfig, RAGConfig
from src.core.retrieval_utils import (
    apply_scripture_boost,
    fuse_hybrid_scores,
    select_diverse_context,
)
from src.utils.scripture import (
    ScripturePreference,
    build_index_text,
    truncate_passage,
)

logger = logging.getLogger(__name__)


class VedicKnowledgeRetriever:
    """Hybrid retriever with score fusion, optional cross-encoder reranking, and scripture awareness."""

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or RAGConfig.EMBEDDING_MODEL
        self.model = SentenceTransformer(self.model_name)
        self.reranker: Optional[CrossEncoder] = None
        self.bm25: Optional[BM25Okapi] = None
        self.verse_rows: List[tuple] = []
        self.setup_database()
        self.setup_bm25()
        logger.info("VedicKnowledgeRetriever initialized with %s", self.model_name)

    def setup_database(self):
        try:
            self.conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
            self.conn.set_session(autocommit=True)
        except Exception as e:
            logger.error("Database connection failed: %s", e)
            raise

    def setup_bm25(self):
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    "SELECT id, book, chapter, verse, sanskrit, translation, explanation "
                    "FROM verses ORDER BY id"
                )
                self.verse_rows = cur.fetchall()

            docs = [
                build_index_text(row[5], row[6], RAGConfig.MAX_PASSAGE_CHARS).lower()
                for row in self.verse_rows
            ]
            tokenized_docs = [word_tokenize(doc) for doc in docs if doc]
            self.bm25 = BM25Okapi(tokenized_docs)
            logger.info("BM25 index created for %s verses", len(self.verse_rows))
        except Exception as e:
            logger.error("BM25 setup failed: %s", e)
            raise

    def _encode_query(self, query: str):
        return self.model.encode(
            query,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    def get_verses_hybrid(
        self,
        query: str,
        top_k: Optional[int] = None,
        scripture_preference: ScripturePreference = "any",
    ) -> List[Dict]:
        top_k = top_k or RAGConfig.TOP_K
        pool = max(RAGConfig.CANDIDATE_POOL, top_k * 2)

        try:
            semantic_results = self._semantic_search(query, pool)
            bm25_results = self._bm25_search(query, pool)
            fused = fuse_hybrid_scores(
                semantic_results,
                bm25_results,
                RAGConfig.SEMANTIC_WEIGHT,
                RAGConfig.BM25_WEIGHT,
            )
            ranked = list(fused.values())
            ranked = apply_scripture_boost(
                ranked, scripture_preference, RAGConfig.SCRIPTURE_BOOST
            )
            ranked.sort(key=lambda r: r.get("final_score", 0), reverse=True)

            if RAGConfig.ENABLE_RERANKER and ranked:
                ranked = self._rerank_with_cross_encoder(query, ranked)

            final = select_diverse_context(ranked, top_k, scripture_preference)
            for item in final:
                if item.get("confidence_score") is None:
                    item["confidence_score"] = item.get("final_score", 0.0)
            logger.info(
                "Retrieved %s verses (preference=%s) for query: %s",
                len(final),
                scripture_preference,
                query[:80],
            )
            return final
        except Exception as e:
            logger.error("Verse retrieval failed: %s", e)
            return []

    def _semantic_search(self, query: str, top_k: int) -> List[Dict]:
        query_embedding = self._encode_query(query)
        vector_str = f"[{','.join(map(str, query_embedding))}]"

        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, book, chapter, verse, sanskrit, translation, explanation,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM verses
                WHERE 1 - (embedding <=> %s::vector) > %s
                ORDER BY similarity DESC
                LIMIT %s
                """,
                (
                    vector_str,
                    vector_str,
                    RAGConfig.SEMANTIC_THRESHOLD,
                    top_k,
                ),
            )
            return self._format_results(cur.fetchall(), include_similarity=True)

    def _bm25_search(self, query: str, top_k: int) -> List[Dict]:
        tokenized_query = word_tokenize(query.lower())
        scores = self.bm25.get_scores(tokenized_query)

        scored = sorted(
            enumerate(scores),
            key=lambda item: item[1],
            reverse=True,
        )[:top_k]

        results = []
        for idx, score in scored:
            if score <= 0:
                continue
            row = self.verse_rows[idx]
            formatted = self._format_results([row], include_similarity=False)[0]
            formatted["bm25_score"] = float(score)
            results.append(formatted)
        return results

    def _get_reranker(self) -> CrossEncoder:
        if self.reranker is None:
            logger.info("Loading cross-encoder reranker: %s", RAGConfig.RERANKER_MODEL)
            self.reranker = CrossEncoder(RAGConfig.RERANKER_MODEL)
        return self.reranker

    def _rerank_with_cross_encoder(self, query: str, candidates: List[Dict]) -> List[Dict]:
        pool = candidates[: RAGConfig.RERANK_TOP_N * 2]
        if len(pool) <= 1:
            return candidates

        pairs = []
        for verse in pool:
            passage = build_index_text(
                verse.get("translation", ""),
                verse.get("explanation", ""),
                RAGConfig.MAX_PASSAGE_CHARS,
            )
            pairs.append((query, passage))

        try:
            reranker = self._get_reranker()
            scores = reranker.predict(pairs)
            for verse, score in zip(pool, scores):
                verse["rerank_score"] = float(score)
                # Blend hybrid score with reranker (reranker weighted higher)
                verse["final_score"] = (
                    0.35 * verse.get("final_score", 0.0) + 0.65 * float(score)
                )
            pool.sort(key=lambda r: r.get("final_score", 0), reverse=True)
            reranked_ids = {v["id"] for v in pool}
            tail = [c for c in candidates if c["id"] not in reranked_ids]
            return pool + tail
        except Exception as e:
            logger.warning("Reranker failed, using hybrid scores: %s", e)
            return candidates

    def _format_results(
        self,
        verses: List[tuple],
        include_similarity: bool = False,
    ) -> List[Dict]:
        results = []
        for verse in verses:
            item = {
                "id": verse[0],
                "book": verse[1],
                "chapter": verse[2],
                "verse": verse[3],
                "sanskrit": verse[4],
                "translation": verse[5],
                "explanation": verse[6],
            }
            if include_similarity and len(verse) > 7:
                item["confidence_score"] = float(verse[7])
            results.append(item)
        return results
