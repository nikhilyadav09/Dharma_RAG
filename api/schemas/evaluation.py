from pydantic import BaseModel, Field


class EvaluationSummaryResponse(BaseModel):
    model_name: str
    average_semantic_similarity: float
    average_bleu_score: float
    average_rouge1: float
    average_rouge2: float
    average_rougeL: float
    average_question_match_score: float
    num_samples: int
    source_file: str = Field(
        ...,
        description="Path to the evaluation summary JSON file relative to project root",
    )
