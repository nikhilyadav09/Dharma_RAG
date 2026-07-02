from typing import Dict, List, Optional
import logging

from src.core.conversation_store import get_conversation_store
from src.core.generator import WisdomResponseGenerator
from src.core.metadata_retriever import MetadataRetriever
from src.core.retriever import VedicKnowledgeRetriever
from src.core.query_preprocessor import QueryProcessor
from src.utils.intent_router import IntentResult, detect_intent

logger = logging.getLogger(__name__)


class VedicWisdomPipeline:
    """RAG pipeline with metadata lookup, conversation memory, and intent routing."""

    def __init__(self):
        try:
            self.preprocessor = QueryProcessor()
            self.retriever = VedicKnowledgeRetriever()
            self.metadata_retriever = MetadataRetriever()
            self.generator = WisdomResponseGenerator()
            self.conversation_store = get_conversation_store()
            logger.info("VedicWisdomPipeline initialized successfully")
        except Exception as e:
            logger.error("Pipeline initialization failed: %s", e)
            raise

    async def process_query(
        self,
        query: str,
        session_id: Optional[str] = None,
    ) -> Dict:
        try:
            session = self.conversation_store.get_or_create(session_id)
            has_conversation = bool(session.turns)

            processed = self.preprocessor.process_query(query)
            intent = detect_intent(processed["processed_query"], has_conversation)

            if processed["needs_clarification"] and intent["intent"] not in (
                "greeting",
                "factual",
            ):
                return self._handle_clarification_needed(processed["original_query"])

            conversation_context = session.context_block() if has_conversation else ""

            verses = self._retrieve_verses(
                processed["processed_query"],
                processed.get("scripture_preference", "any"),
                intent,
                has_conversation,
            )
            logger.info("Retrieved %s verses (intent=%s)", len(verses), intent["intent"])

            if not verses and intent["intent"] not in ("greeting", "non_philosophical"):
                return self._handle_no_verses()

            result = await self.generator.generate_answer(
                processed["processed_query"],
                verses,
                processed["word_count"],
                conversation_context=conversation_context,
                has_conversation=has_conversation,
                intent_result=intent,
            )

            self._save_turn(session, processed["original_query"], result)

            result["query_info"] = {
                "original": processed["original_query"],
                "processed": processed["processed_query"],
            }
            result["session_id"] = session.session_id
            result["intent"] = intent["intent"]
            return result

        except Exception as e:
            logger.error("Query processing failed: %s", e)
            return {"error": str(e)}

    def _retrieve_verses(
        self,
        query: str,
        scripture_preference: str,
        intent: IntentResult,
        has_conversation: bool,
    ) -> List[Dict]:
        metadata_hits = self.metadata_retriever.lookup(query, scripture_preference)
        if metadata_hits:
            logger.info("Metadata lookup returned %s verse(s)", len(metadata_hits))
            return metadata_hits

        augmented_query = query
        if intent["is_follow_up"] and has_conversation:
            augmented_query = f"{query} (continuing prior spiritual discussion)"

        hybrid = self.retriever.get_verses_hybrid(
            augmented_query,
            scripture_preference=scripture_preference,
        )
        return hybrid

    def _save_turn(self, session, query: str, result: Dict) -> None:
        response = result.get("response") or {}
        summary = response.get("summary", "")
        if not summary:
            return
        primary = result.get("verse") or {}
        primary_ref = None
        if primary:
            primary_ref = f"{primary.get('book')} {primary.get('chapter')}.{primary.get('verse')}"
        session.add_turn(
            query=query,
            summary=summary,
            sources=response.get("sources"),
            primary_ref=primary_ref,
        )

    def _handle_clarification_needed(self, query: str) -> Dict:
        return {
            "type": "clarification_needed",
            "response": {
                "summary": (
                    f"Could you share a bit more detail about your question: '{query}'? "
                    "A specific teaching, chapter, or principle will help me find the most relevant wisdom."
                ),
                "sources": [],
                "related_questions": [
                    "What is karma yoga?",
                    "What does the Gita teach about duty?",
                    "What is meditation in the Yoga Sutras?",
                ],
            },
        }

    def _handle_no_verses(self) -> Dict:
        return {
            "type": "no_results",
            "response": {
                "summary": (
                    "I couldn't find relevant verses. Try naming a scripture, chapter, or verse, "
                    "or rephrase with more detail about the teaching you seek."
                ),
                "sources": [],
                "related_questions": [
                    "What is dharma?",
                    "What is the purpose of yoga?",
                    "What did Krishna teach about action?",
                ],
            },
        }
