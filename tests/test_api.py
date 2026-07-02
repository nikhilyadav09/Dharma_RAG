"""API endpoint tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def mock_pipeline():
    pipeline = MagicMock()
    pipeline.process_query = AsyncMock(
        return_value={
            "type": "wisdom_response",
            "verse": {
                "id": 1,
                "book": "Bhagavad Gita",
                "chapter": 2,
                "verse": "47",
                "sanskrit": "test",
                "translation": "test translation",
                "explanation": "test explanation",
                "confidence_score": 0.82,
            },
            "response": {
                "summary": "Focus on your duty without attachment to results.",
                "sources": ["Bhagavad Gita 2.47"],
            },
            "query_info": {
                "original": "What is karma yoga?",
                "processed": "What is the nature of karma yoga?",
            },
        }
    )
    return pipeline


@pytest.fixture
def client(mock_pipeline):
    with patch("api.dependencies.VedicWisdomPipeline", return_value=mock_pipeline):
        from api.main import app

        with TestClient(app) as test_client:
            yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "dharma-api"


def test_ready_endpoint(client):
    with patch("api.routes.health.check_database_connection", return_value=True):
        response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["pipeline_initialized"] is True
    assert data["database_connected"] is True


def test_chat_endpoint(client, mock_pipeline):
    response = client.post(
        "/api/v1/chat",
        json={"query": "What is karma yoga?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "wisdom_response"
    assert data["answer"]["summary"]
    assert data["primary_verse"]["book"] == "Bhagavad Gita"
    assert data["metadata"]["latency_ms"] >= 0
    mock_pipeline.process_query.assert_awaited_once()


def test_chat_validation_rejects_empty_query(client):
    response = client.post("/api/v1/chat", json={"query": ""})
    assert response.status_code == 422


def test_evaluation_summary_endpoint(client):
    response = client.get("/api/v1/evaluation/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "llama-3.3-70b-versatile"
    assert data["num_samples"] == 10
    assert data["source_file"].startswith("evaluation_summary_")


def test_response_mapper_error_type():
    from api.services.response_mapper import map_pipeline_response

    response, status_code = map_pipeline_response(
        {"error": "Database connection failed"},
        "test query",
        10,
    )
    assert status_code == 500
    assert response.type == "error"
    assert response.error == "Database connection failed"


def test_response_mapper_clarification_needed():
    from api.services.response_mapper import map_pipeline_response

    response, status_code = map_pipeline_response(
        {
            "type": "clarification_needed",
            "response": {
                "summary": "Please provide more details.",
                "sources": [],
            },
        },
        "hi",
        5,
    )
    assert status_code == 200
    assert response.type == "clarification_needed"
    assert response.answer.summary == "Please provide more details."
