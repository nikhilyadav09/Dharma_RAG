"""Response generator with intent routing, adaptive length, and follow-up questions."""

import logging
import re
from typing import Dict, List, Optional, Tuple

from groq import AsyncGroq
from nltk.tokenize import sent_tokenize
import nltk

nltk.download("punkt_tab", quiet=True)
nltk.download("punkt", quiet=True)

from src.config.settings import LLMConfig, RAGConfig
from src.config.prompts import RELATED_QUESTIONS_MARKER, PromptTemplates
from src.utils.intent_router import IntentResult, detect_intent, words_to_max_tokens
from src.utils.scripture import truncate_passage

logger = logging.getLogger(__name__)


class WisdomResponseGenerator:
    """Intent-aware response generator with Markdown structure and follow-ups."""

    def __init__(self):
        try:
            self.api_keys = [
                key for key in [LLMConfig.API_KEY1, LLMConfig.API_KEY2, LLMConfig.API_KEY3]
                if key
            ]
            self.current_key_index = 0
            self.client = self._get_client()
            logger.info("WisdomResponseGenerator initialized successfully")
        except Exception as e:
            logger.error("Generator initialization failed: %s", e)
            self.client = None

    def _get_client(self):
        if not self.api_keys:
            return None
        api_key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return AsyncGroq(api_key=api_key)

    async def generate_answer(
        self,
        query: str,
        verses: List[Dict],
        word_count: int,
        conversation_context: str = "",
        has_conversation: bool = False,
        intent_result: Optional[IntentResult] = None,
    ) -> Dict:
        try:
            intent = intent_result or detect_intent(query, has_conversation)

            if intent["intent"] == "non_philosophical":
                return self._generate_clarification_response(query)

            if intent["intent"] == "greeting":
                return await self._generate_greeting_response(query, intent)

            if not verses or self.client is None:
                return self._handle_empty_results(verses)

            context_verses = self._select_context_verses(verses)
            prompt = self._prepare_prompt(
                query, context_verses, intent, conversation_context
            )
            max_tokens = words_to_max_tokens(intent["target_words"])
            response = await self._generate_llm_response(prompt, max_tokens)
            answer_text, related = self._extract_related_questions(response)

            return self._format_response(answer_text, verses, context_verses, related)
        except Exception as e:
            logger.error("Answer generation failed: %s", e)
            return self._generate_fallback_response(e, verses)

    def _select_context_verses(self, verses: List[Dict]) -> List[Dict]:
        """One primary + up to two supporting verses."""
        limit = min(RAGConfig.CONTEXT_VERSES, 3)
        return verses[:limit]

    def _prepare_prompt(
        self,
        query: str,
        verses: List[Dict],
        intent: IntentResult,
        conversation_context: str,
    ) -> str:
        verse_citations = self._format_verse_citations(verses)
        conv_block = ""
        if conversation_context:
            conv_block = f"\n{conversation_context}\n"
        return PromptTemplates.format_prompt(
            intent["intent"],
            query,
            verse_citations,
            conversation_context=conv_block,
        )

    def _format_verse_citations(self, verses: List[Dict]) -> str:
        citations = []
        roles = ["PRIMARY", "SUPPORTING", "SUPPORTING"]
        for idx, verse in enumerate(verses):
            role = roles[idx] if idx < len(roles) else "RELATED"
            ref = f"{verse['book']} {verse['chapter']}.{verse['verse']}"
            translation = truncate_passage(verse.get("translation") or "", 350)
            explanation = truncate_passage(verse.get("explanation") or "", 400)
            citation = f"[{role}: {ref}]\nTranslation: {translation}"
            if explanation and explanation != translation:
                citation += f"\nContext: {explanation}"
            citations.append(citation)
        return "\n\n".join(citations)

    async def _generate_llm_response(self, prompt: str, max_tokens: int) -> str:
        response = await self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are DHARMA, a wise teacher of ancient scripture. "
                        "Synthesize teachings into clear concepts — never copy long passages. "
                        "Always use Markdown. Include inline citations like (Bhagavad Gita 2.47)."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            model=LLMConfig.MODEL_NAME,
            max_tokens=max_tokens,
            temperature=LLMConfig.TEMPERATURE,
        )
        text = response.choices[0].message.content.strip()
        text = self._ensure_complete_sentences(text)
        return self._postprocess_response(text)

    async def _generate_greeting_response(
        self, query: str, intent: IntentResult
    ) -> Dict:
        if self.client is None:
            return {
                "type": "clarification",
                "response": {
                    "summary": (
                        "# Welcome\n\n"
                        "Namaste. I am DHARMA — ask me about the Bhagavad Gita, "
                        "Yoga Sutras, dharma, yoga, or meditation."
                    ),
                    "sources": [],
                    "related_questions": [
                        "What is karma yoga?",
                        "What does Patanjali teach about meditation?",
                        "How can I practice detachment?",
                    ],
                },
            }

        prompt = PromptTemplates.format_prompt("greeting", query, verses="")
        text = await self._generate_llm_response(
            prompt, words_to_max_tokens(intent["target_words"])
        )
        answer, related = self._extract_related_questions(text)
        return {
            "type": "clarification",
            "response": {
                "summary": answer,
                "sources": [],
                "related_questions": related
                or [
                    "What is dharma?",
                    "What is the purpose of yoga?",
                    "What did Krishna teach Arjuna?",
                ],
            },
        }

    def _extract_related_questions(self, text: str) -> Tuple[str, List[str]]:
        if RELATED_QUESTIONS_MARKER not in text:
            return text, []

        main, _, tail = text.partition(RELATED_QUESTIONS_MARKER)
        questions = []
        for line in tail.strip().splitlines():
            cleaned = re.sub(r"^[-*•\d.]+\s*", "", line).strip()
            if cleaned.endswith("?"):
                questions.append(cleaned)
            elif cleaned and len(questions) < 3:
                questions.append(cleaned.rstrip(".") + "?")

        return main.strip(), questions[:3]

    def _format_response(
        self,
        response: str,
        verses: List[Dict],
        context_verses: List[Dict],
        related_questions: List[str],
    ) -> Dict:
        primary = verses[0] if verses else None
        if primary and primary.get("confidence_score") is None:
            primary["confidence_score"] = primary.get("final_score")

        source_refs = [
            f"{v['book']} {v['chapter']}.{v['verse']}" for v in context_verses
        ]

        if not related_questions:
            related_questions = self._default_related_questions(context_verses)

        return {
            "type": "wisdom_response",
            "verse": primary,
            "response": {
                "summary": response,
                "sources": source_refs,
                "related_questions": related_questions,
            },
        }

    def _default_related_questions(self, verses: List[Dict]) -> List[str]:
        if not verses:
            return [
                "What is karma yoga?",
                "How does Patanjali define meditation?",
                "What is the nature of the self?",
            ]
        ref = verses[0]
        book = ref.get("book", "scripture")
        return [
            f"What else does {book} teach on this topic?",
            "How can I apply this teaching daily?",
            "What is the deeper philosophical meaning?",
        ]

    def _generate_clarification_response(self, query: str) -> Dict:
        return {
            "type": "clarification",
            "response": {
                "summary": PromptTemplates.clarification.format(query=query),
                "sources": [],
                "related_questions": [
                    "What is dharma?",
                    "What is karma yoga?",
                    "What are the Yoga Sutras?",
                ],
            },
        }

    def _handle_empty_results(self, verses: Optional[List[Dict]]) -> Dict:
        return {
            "type": "wisdom_response",
            "verse": None,
            "response": {
                "summary": (
                    "# Summary\n\n"
                    "I could not find specific verses for your question. "
                    "Try rephrasing with more detail or naming a scripture, chapter, or verse."
                ),
                "sources": [],
                "related_questions": [
                    "What is karma yoga?",
                    "What does the Bhagavad Gita teach about duty?",
                    "What is meditation according to Patanjali?",
                ],
            },
        }

    def _ensure_complete_sentences(self, text: str) -> str:
        sentences = sent_tokenize(text)
        if not sentences:
            return text
        complete = []
        for sentence in sentences:
            if sentence.strip().endswith((".", "?", "!", ":", "|")) or sentence.startswith(
                ("#", "|", "-")
            ):
                complete.append(sentence)
            elif sentence == sentences[-1] and not sentence.startswith("#"):
                complete.append(sentence.strip() + ".")
            else:
                complete.append(sentence)
        return " ".join(complete)

    def _postprocess_response(self, response: str) -> str:
        response = response.strip()
        response = re.sub(r"\n{4,}", "\n\n\n", response)
        response = re.sub(r"[ \t]+\n", "\n", response)
        return response

    def _generate_fallback_response(self, error: Exception, verses: List[Dict]) -> Dict:
        logger.error("Using fallback response due to: %s", error)
        context = verses[: RAGConfig.CONTEXT_VERSES] if verses else []
        return {
            "type": "wisdom_response",
            "verse": verses[0] if verses else None,
            "response": {
                "summary": self._generate_structured_fallback(),
                "sources": [
                    f"{v['book']} {v['chapter']}.{v['verse']}" for v in context
                ],
                "related_questions": [
                    "What is karma yoga?",
                    "What is dharma?",
                    "How do I practice meditation?",
                ],
            },
        }

    def _generate_structured_fallback(self) -> str:
        return """# Summary
I found relevant teachings but could not complete a full response right now. Please try again.

---

# Key Insights
- Ancient wisdom emphasizes clarity, duty, and inner equanimity.
- The texts encourage reflection rather than hasty conclusions.

---

# Practical Takeaways
- Rephrase your question with a specific focus.
- Ask about one principle at a time for the clearest guidance.
"""
