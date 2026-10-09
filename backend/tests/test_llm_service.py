import pytest
from unittest.mock import patch, MagicMock
import requests
from backend.app import create_app
from backend.services.llm_service import llm_service, GeminiProvider
from backend.services.response_router import response_router
from backend.services.memory_service import memory_service
from backend.config import config

@pytest.fixture
def app_ctx():
    app = create_app()
    with app.app_context():
        yield

def test_gemini_provider_success():
    with patch("requests.post") as mock_post, patch.object(config, "GOOGLE_API_KEY", "mock_key"):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Hello! I am Google Gemini AI."}]
                    }
                }
            ]
        }
        mock_post.return_value = mock_response

        res = llm_service.generate_response(prompt="Hello Gemini", session_id="test_session_gemini")
        assert res["success"] is True
        assert res["response"] == "Hello! I am Google Gemini AI."
        assert res["provider"] == "Gemini AI"

def test_gemini_provider_timeout():
    with patch("requests.post", side_effect=requests.exceptions.Timeout("Connection timed out")), \
         patch("time.sleep"), patch.object(config, "GOOGLE_API_KEY", "mock_key"):
        res = llm_service.generate_response(prompt="Timeout test", session_id="test_timeout")
        assert res["success"] is False
        assert res["response"] is None
        assert res["provider"] == "Local Fallback"
        assert "timed out" in res["error"]

def test_gemini_provider_invalid_api_key():
    with patch("requests.post") as mock_post, patch.object(config, "GOOGLE_API_KEY", "invalid_key"):
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_post.return_value = mock_response

        res = llm_service.generate_response(prompt="Invalid key test", session_id="test_key")
        assert res["success"] is False
        assert res["response"] is None
        assert "Authentication or Client Error" in res["error"]

def test_gemini_provider_rate_limit_429():
    with patch("requests.post") as mock_post, patch("time.sleep"), patch.object(config, "GOOGLE_API_KEY", "mock_key"):
        mock_429 = MagicMock()
        mock_429.status_code = 429

        mock_200 = MagicMock()
        mock_200.status_code = 200
        mock_200.json.return_value = {
            "candidates": [{"content": {"parts": [{"text": "Recovered after rate limit"}]}}]
        }
        mock_post.side_effect = [mock_429, mock_200]

        res = llm_service.generate_response(prompt="Rate limit test", session_id="test_429")
        assert res["success"] is True
        assert res["response"] == "Recovered after rate limit"

def test_response_router_fallback_hierarchy(app_ctx):
    # Test Tier 1: Deterministic Greeting Intent or Local NLP Model response
    res_t1 = response_router.process_message(session_id="s1", user_message="Hello good morning")
    assert res_t1["success"] is True
    assert res_t1["provider"] in ["Intent Handler", "FAQ Engine", "Local NLP Model", "Gemini AI"]

    # Test Tier 3/4/5: Generative LLM Failure Fallback
    with patch.object(llm_service, "generate_response", return_value={"success": False, "response": None, "provider": "Local Fallback", "error": "API Down"}):
        res_fb = response_router.process_message(session_id="s_fb", user_message="Complex quantum physics query that fails LLM")
        assert res_fb["success"] is True
        assert res_fb["provider"] in ["Local NLP Model", "Friendly Fallback"]
        assert len(res_fb["message"]["content"]) > 0

def test_context_memory_sliding_window(app_ctx):
    session_id = "test_sliding_window_session"
    memory_service.clear_history(session_id)

    # Add 25 messages
    for i in range(25):
        memory_service.add_message(
            session_id=session_id,
            role="user" if i % 2 == 0 else "assistant",
            content=f"Message {i}"
        )

    history = memory_service.get_history(session_id, max_messages=20)
    assert len(history) == 20
    assert history[-1]["content"] == "Message 24"
    assert history[0]["content"] == "Message 5"

