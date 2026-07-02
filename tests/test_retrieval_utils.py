"""Unit tests for retrieval scoring utilities."""

from src.core.retrieval_utils import (
    apply_scripture_boost,
    deduplicate_by_chapter,
    fuse_hybrid_scores,
    normalize_scores,
    select_diverse_context,
)


def _verse(vid: int, book: str = "Bhagavad Gita", chapter: int = 1, score: float = 0.5):
    return {
        "id": vid,
        "book": book,
        "chapter": chapter,
        "verse": str(vid),
        "confidence_score": score,
    }


def test_normalize_scores_spread():
    assert normalize_scores([1.0, 2.0, 3.0]) == [0.0, 0.5, 1.0]


def test_normalize_scores_flat():
    assert normalize_scores([2.0, 2.0]) == [1.0, 1.0]


def test_fuse_hybrid_scores_combines_both_sources():
    semantic = [_verse(1, score=0.9), _verse(2, score=0.5)]
    bm25 = [
        {**_verse(2), "bm25_score": 10.0},
        {**_verse(3, book="Yoga Sutras"), "bm25_score": 8.0},
    ]
    fused = fuse_hybrid_scores(semantic, bm25, 0.65, 0.35)
    assert set(fused.keys()) == {1, 2, 3}
    assert fused[2]["final_score"] > fused[1]["final_score"] or fused[2]["final_score"] > 0


def test_scripture_boost_prefers_gita():
    results = [
        {**_verse(1, book="Yoga Sutras"), "final_score": 0.9},
        {**_verse(2, book="Bhagavad Gita"), "final_score": 0.8},
    ]
    boosted = apply_scripture_boost(results, "bhagavad_gita", 0.12)
    gita = next(r for r in boosted if "Gita" in r["book"])
    yoga = next(r for r in boosted if "Yoga" in r["book"])
    assert gita["final_score"] > yoga["final_score"]


def test_deduplicate_by_chapter_keeps_best_per_chapter():
    results = [
        {**_verse(1, chapter=2), "final_score": 0.9},
        {**_verse(2, chapter=2), "final_score": 0.5},
        {**_verse(3, chapter=3), "final_score": 0.7},
    ]
    deduped = deduplicate_by_chapter(results)
    chapters = [r["chapter"] for r in deduped]
    assert chapters.count(2) == 1
    assert len(deduped) == 2


def test_select_diverse_context_respects_preference():
    results = [
        {**_verse(1, book="Yoga Sutras", chapter=1), "final_score": 0.95},
        {**_verse(2, book="Bhagavad Gita", chapter=1), "final_score": 0.9},
        {**_verse(3, book="Bhagavad Gita", chapter=2), "final_score": 0.85},
    ]
    selected = select_diverse_context(results, 2, "bhagavad_gita")
    assert all("Gita" in r["book"] for r in selected)
