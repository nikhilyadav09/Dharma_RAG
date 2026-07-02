"""Tests for metadata verse lookup parsing."""

from src.core.metadata_retriever import MetadataRetriever


def test_extract_chapter_verse_dot_notation():
    retriever = MetadataRetriever(conn=None)
    chapter, verse = retriever._extract_chapter_verse("what is bhagavad gita 2.47 about")
    assert chapter == 2
    assert verse == "47"


def test_extract_chapter_verse_explicit():
    retriever = MetadataRetriever(conn=None)
    chapter, verse = retriever._extract_chapter_verse("chapter 2 verse 47")
    assert chapter == 2
    assert verse == "47"
