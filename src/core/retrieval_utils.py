"""Pure functions for retrieval scoring and result selection."""

from typing import Dict, List, Optional

from src.utils.scripture import book_matches_preference


def normalize_scores(scores: List[float]) -> List[float]:
    if not scores:
        return []
    min_s, max_s = min(scores), max(scores)
    if max_s == min_s:
        return [1.0 for _ in scores]
    return [(s - min_s) / (max_s - min_s) for s in scores]


def fuse_hybrid_scores(
    semantic_results: List[Dict],
    bm25_results: List[Dict],
    semantic_weight: float,
    bm25_weight: float,
) -> Dict[int, Dict]:
    """Score-based fusion keyed by verse id."""
    combined: Dict[int, Dict] = {}

    sem_scores = normalize_scores(
        [r.get("confidence_score") or 0.0 for r in semantic_results]
    )
    for result, norm in zip(semantic_results, sem_scores):
        combined[result["id"]] = {**result, "final_score": semantic_weight * norm}

    bm25_raw = [r.get("bm25_score", 0.0) for r in bm25_results]
    bm25_norm = normalize_scores(bm25_raw)
    for result, norm in zip(bm25_results, bm25_norm):
        vid = result["id"]
        if vid in combined:
            combined[vid]["final_score"] += bm25_weight * norm
            combined[vid]["bm25_score"] = result.get("bm25_score")
        else:
            combined[vid] = {
                **result,
                "final_score": bm25_weight * norm,
            }

    return combined


def apply_scripture_boost(
    results: List[Dict],
    preference: str,
    boost: float,
) -> List[Dict]:
    if preference == "any":
        return results
    for result in results:
        if book_matches_preference(result.get("book", ""), preference):
            result["final_score"] = result.get("final_score", 0.0) + boost
    return results


def deduplicate_by_chapter(results: List[Dict]) -> List[Dict]:
    """Keep highest-scoring verse per book+chapter to improve diversity."""
    seen: Dict[tuple, Dict] = {}
    for result in sorted(results, key=lambda r: r.get("final_score", 0), reverse=True):
        key = (result.get("book"), result.get("chapter"))
        if key not in seen:
            seen[key] = result
    return list(seen.values())


def select_diverse_context(
    results: List[Dict],
    limit: int,
    preference: str = "any",
) -> List[Dict]:
    """Select top verses with scripture preference and chapter diversity."""
    ranked = sorted(results, key=lambda r: r.get("final_score", 0), reverse=True)
    ranked = deduplicate_by_chapter(ranked)

    if preference != "any":
        preferred = [
            r for r in ranked if book_matches_preference(r.get("book", ""), preference)
        ]
        other = [
            r for r in ranked if not book_matches_preference(r.get("book", ""), preference)
        ]
        ranked = preferred + other

    return ranked[:limit]
