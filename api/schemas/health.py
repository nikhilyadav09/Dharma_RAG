from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])
    service: str = Field(..., examples=["dharma-api"])


class ReadyResponse(BaseModel):
    status: str = Field(..., examples=["ready"])
    pipeline_initialized: bool
    database_connected: bool
