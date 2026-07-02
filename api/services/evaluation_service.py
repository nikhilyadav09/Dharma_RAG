import json
import logging
from pathlib import Path

from api.schemas.evaluation import EvaluationSummaryResponse

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def get_evaluation_summary() -> EvaluationSummaryResponse:
    """Load the latest committed evaluation summary JSON from the project root."""
    candidates = sorted(PROJECT_ROOT.glob("evaluation_summary_*.json"))
    if not candidates:
        raise FileNotFoundError("No evaluation summary file found in project root")

    summary_path = candidates[-1]
    with summary_path.open(encoding="utf-8") as handle:
        data = json.load(handle)

    return EvaluationSummaryResponse(
        model_name=data["model_name"],
        average_semantic_similarity=float(data["average_semantic_similarity"]),
        average_bleu_score=float(data["average_bleu_score"]),
        average_rouge1=float(data["average_rouge1"]),
        average_rouge2=float(data["average_rouge2"]),
        average_rougeL=float(data["average_rougeL"]),
        average_question_match_score=float(data["average_question_match_score"]),
        num_samples=int(data["num_samples"]),
        source_file=str(summary_path.relative_to(PROJECT_ROOT)),
    )
