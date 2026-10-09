from flask import Blueprint, jsonify
from backend.config import config
from backend.services.intent_service import intent_service

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint providing system, model, and API configuration status."""
    return jsonify({
        "status": "healthy",
        "gemini_api_configured": bool(config.GOOGLE_API_KEY),
        "gemini_model": config.GEMINI_MODEL,
        "intent_model_loaded": intent_service.model is not None,
        "confidence_threshold": config.INTENT_CONFIDENCE_THRESHOLD,
        "max_context_messages": config.MAX_CONTEXT_MESSAGES
    }), 200
