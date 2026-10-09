import pytest
from unittest.mock import patch
from backend.app import create_app
from backend.services.response_router import response_router
from backend.services.intent_service import intent_service
from backend.services.llm_service import llm_service

@pytest.fixture
def app_ctx():
    app = create_app()
    with app.app_context():
        yield

def test_intent_service_multilingual_responses():
    """Verify intent service produces English, Hindi, and Hinglish responses."""
    greeting_en = intent_service.get_intent_response("greeting", language="en")
    assert any(word in greeting_en for word in ["Hello", "Hi", "Greetings", "assist"])

    greeting_hi = intent_service.get_intent_response("greeting", language="hi")
    assert any(word in greeting_hi for word in ["नमस्ते", "नमस्कार", "सहायता", "मदद"])

    greeting_hinglish = intent_service.get_intent_response("greeting", language="hinglish")
    assert any(word in greeting_hinglish.lower() for word in ["namaste", "hello", "help", "aaj"])

def test_response_router_language_selection(app_ctx):
    """Verify router passes language parameter and returns localized responses."""
    # Test Tier 1 Greeting in Hindi
    res_hi = response_router.process_message(
        session_id="test_multilingual_hi",
        user_message="Hello!",
        language="hi"
    )
    assert res_hi["success"] is True
    assert any(word in res_hi["message"]["content"] for word in ["नमस्ते", "नमस्कार", "सहायता", "मदद"])

    # Test Tier 1 Greeting in Hinglish
    res_hinglish = response_router.process_message(
        session_id="test_multilingual_hinglish",
        user_message="Hello!",
        language="hinglish"
    )
    assert res_hinglish["success"] is True
    assert any(word in res_hinglish["message"]["content"].lower() for word in ["namaste", "hello", "help", "aaj"])

def test_llm_system_prompt_multilingual():
    """Verify LLM system prompt incorporates English, Hindi, and Hinglish guidelines."""
    prompt_en = llm_service.build_system_prompt(language="en")
    assert "Respond in English." in prompt_en

    prompt_hi = llm_service.build_system_prompt(language="hi")
    assert "Respond clearly and naturally in Hindi (using Devanagari script)." in prompt_hi

    prompt_hinglish = llm_service.build_system_prompt(language="hinglish")
    assert "Respond naturally in Hinglish" in prompt_hinglish

def test_fallback_multilingual_responses(app_ctx):
    """Verify Tier 5 fallback outputs language-appropriate friendly messages."""
    with patch("backend.services.intent_service.intent_service.predict_intent") as mock_intent, \
         patch("backend.services.llm_service.llm_service.generate_response") as mock_llm:

        mock_intent.return_value = {"intent": "fallback", "confidence": 0.10}
        mock_llm.return_value = {"success": False, "response": None, "provider": "Local Fallback"}

        # Hindi fallback
        res_hi = response_router.process_message(
            session_id="test_fallback_hi",
            user_message="xyz123 unhandled query",
            language="hi"
        )
        assert res_hi["provider"] == "Friendly Fallback"
        assert "क्षमा करें" in res_hi["message"]["content"]

        # Hinglish fallback
        res_hinglish = response_router.process_message(
            session_id="test_fallback_hinglish",
            user_message="xyz123 unhandled query",
            language="hinglish"
        )
        assert res_hinglish["provider"] == "Friendly Fallback"
        assert "Sorry, main abhi aapke request ko fully process nahi kar paya." in res_hinglish["message"]["content"]
