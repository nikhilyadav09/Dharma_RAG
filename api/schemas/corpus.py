from pydantic import BaseModel, Field


class BookVerseCount(BaseModel):
    book: str
    count: int


class CorpusStatsResponse(BaseModel):
    total_verses: int
    books: list[BookVerseCount] = Field(default_factory=list)
