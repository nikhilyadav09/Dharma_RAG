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
    with patch(
        "api.dependencies.VedicWisdomPipeline", return_value=mock_pipeline
    ):
        from api.main import app

        with TestClient(app) as test_client:
            yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "dharma-api"


def test_ready_before_pipeline_init(client):
    """Ready returns 503 until the pipeline is lazily initialized."""
    with patch(
        "api.routes.health.check_database_connection", return_value=True
    ):
        response = client.get("/ready")
    assert response.status_code == 503
    data = response.json()["detail"]
    assert data["pipeline_initialized"] is False
    assert data["database_connected"] is True


def test_ready_endpoint(client, mock_pipeline):
    with patch(
        "api.routes.health.check_database_connection", return_value=True
    ):
        client.post("/api/v1/chat", json={"query": "What is karma yoga?"})
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


def test_get_pipeline_returns_503_when_init_fails():
    from api.dependencies import get_pipeline, shutdown_pipeline

    shutdown_pipeline()
    with patch(
        "api.dependencies.VedicWisdomPipeline",
        side_effect=RuntimeError("init failed"),
    ):
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            get_pipeline()
        assert exc_info.value.status_code == 503
        assert "init failed" in str(exc_info.value.detail)
    shutdown_pipeline()


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
