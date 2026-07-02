import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.translate.bleu_score import sentence_bleu
from rouge_score import rouge_scorer
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional
import json
import logging

from src.config.settings import RAGConfig
from src.evaluation.quality_metrics import (
    score_answer_length,
    score_citation_overlap,
    score_groundedness_proxy,
    score_markdown_structure,
    score_readability,
    score_verse_diversity,
)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

class WisdomEvaluator:
    def __init__(self):
        self.model = SentenceTransformer(RAGConfig.EMBEDDING_MODEL)
        self.rouge_scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
        self.bhagavad_gita_refs = pd.read_csv(DATA_DIR / "Bhagwad_Gita_Verses_English_Questions.csv")
        self.yoga_sutras_refs = pd.read_csv(DATA_DIR / "Patanjali_Yoga_Sutras_Verses_English_Questions.csv")
        
    def find_matching_reference(self, query: str) -> Dict:
        gita_similarities = self.calculate_batch_similarities(query, self.bhagavad_gita_refs['question'].tolist())
        yoga_similarities = self.calculate_batch_similarities(query, self.yoga_sutras_refs['question'].tolist())
        
        if max(gita_similarities) > max(yoga_similarities):
            idx = np.argmax(gita_similarities)
            ref = self.bhagavad_gita_refs.iloc[idx]
            source = 'bhagavad_gita'
        else:
            idx = np.argmax(yoga_similarities)
            ref = self.yoga_sutras_refs.iloc[idx]
            source = 'yoga_sutras'
            
        return {
            'question': ref['question'],
            'translation': ref['translation'],
            'source': source,
            'chapter': ref['chapter'],
            'verse': ref['verse'],
            'similarity_score': max(max(gita_similarities), max(yoga_similarities))
        }
    
    def calculate_batch_similarities(self, query: str, references: List[str]) -> List[float]:
        query_emb = self.model.encode([query], normalize_embeddings=True)
        ref_emb = self.model.encode(references, normalize_embeddings=True)
        return cosine_similarity(query_emb, ref_emb)[0]

    def calculate_semantic_similarity(self, generated: str, reference: str) -> float:
        try:
            gen_emb = self.model.encode([generated], normalize_embeddings=True)
            ref_emb = self.model.encode([reference], normalize_embeddings=True)
            return float(cosine_similarity(gen_emb, ref_emb)[0][0])
        except Exception as e:
            logging.error(f"Error calculating semantic similarity: {e}")
            return 0.0

    def calculate_bleu_score(self, generated: str, reference: str) -> float:
        try:
            reference = reference.split()
            generated = generated.split()
            return sentence_bleu([reference], generated)
        except Exception as e:
            logging.error(f"Error calculating BLEU score: {e}")
            return 0.0

    def calculate_rouge_scores(self, generated: str, reference: str) -> Dict[str, float]:
        try:
            scores = self.rouge_scorer.score(reference, generated)
            return {
                'rouge1': scores['rouge1'].fmeasure,
                'rouge2': scores['rouge2'].fmeasure,
                'rougeL': scores['rougeL'].fmeasure
            }
        except Exception as e:
            logging.error(f"Error calculating ROUGE scores: {e}")
            return {'rouge1': 0.0, 'rouge2': 0.0, 'rougeL': 0.0}

    def evaluate_response(
        self,
        query: str,
        generated_response: str,
        sources: Optional[List[str]] = None,
    ) -> Dict:
        reference = self.find_matching_reference(query)
        
        return {
            'reference_question': reference['question'],
            'reference_translation': reference['translation'],
            'reference_source': reference['source'],
            'reference_chapter': reference['chapter'],
            'reference_verse': reference['verse'],
            'question_match_score': reference['similarity_score'],
            'semantic_similarity': self.calculate_semantic_similarity(generated_response, reference['translation']),
            'bleu_score': self.calculate_bleu_score(generated_response, reference['translation']),
            **self.calculate_rouge_scores(generated_response, reference['translation']),
            'markdown_structure_score': score_markdown_structure(generated_response),
            'readability_score': score_readability(generated_response),
            'citation_overlap_score': score_citation_overlap(generated_response, sources),
            'groundedness_proxy': score_groundedness_proxy(
                generated_response, reference['translation']
            ),
            'answer_length_score': score_answer_length(generated_response),
            'verse_diversity_score': score_verse_diversity(sources),
        }

    def batch_evaluate(self, test_cases: List[Dict]) -> pd.DataFrame:
        results = []
        
        for case in test_cases:
            try:
                metrics = self.evaluate_response(
                    case['query'],
                    case['generated_response'],
                    sources=case.get('sources'),
                )
                results.append({
                    'query': case['query'],
                    **metrics
                })
            except Exception as e:
                logging.error(f"Error evaluating case: {e}")
                continue
        
        return pd.DataFrame(results)

    def save_results(self, results: pd.DataFrame, model_name: str):
        filename = f"evaluation_results_{model_name}.csv"
        results.to_csv(filename, index=False)
        
        summary = {
            'model_name': model_name,
            'embedding_model': RAGConfig.EMBEDDING_MODEL,
            'average_semantic_similarity': float(results['semantic_similarity'].mean()),
            'average_bleu_score': float(results['bleu_score'].mean()),
            'average_rouge1': float(results['rouge1'].mean()),
            'average_rouge2': float(results['rouge2'].mean()),
            'average_rougeL': float(results['rougeL'].mean()),
            'average_question_match_score': float(results['question_match_score'].mean()),
            'average_markdown_structure_score': float(results['markdown_structure_score'].mean()),
            'average_readability_score': float(results['readability_score'].mean()),
            'average_citation_overlap_score': float(results['citation_overlap_score'].mean()),
            'average_groundedness_proxy': float(results['groundedness_proxy'].mean()),
            'average_answer_length_score': float(results['answer_length_score'].mean()),
            'average_verse_diversity_score': float(results['verse_diversity_score'].mean()),
            'num_samples': len(results)
        }
        
        with open(f"evaluation_summary_{model_name}.json", 'w') as f:
            json.dump(summary, f, indent=2)
            
        return summary
