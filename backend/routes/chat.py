import logging
import uuid
from flask import Blueprint, request, jsonify
from backend.services.response_router import response_router
from backend.config import config

logger = logging.getLogger(__name__)
chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    """
    Main Chat API Endpoint.
    Accepts: {
        "message": "User text input",
        "session_id": "optional-uuid",
        "language": "en" | "hi" | "hinglish",
        "temperature": 0.7
    }
    """
    try:
        data = request.get_json() or {}
        message_text = str(data.get("message", "")).strip()
        session_id = data.get("session_id") or str(uuid.uuid4())
        language = data.get("language", "en")
        temperature = float(data.get("temperature", 0.7))

        if not message_text:
            return jsonify({
                "success": False,
                "session_id": session_id,
                "error": "Message content cannot be empty."
            }), 400

        if len(message_text) > config.MAX_MESSAGE_LENGTH:
            return jsonify({
                "success": False,
                "session_id": session_id,
                "error": f"Message content exceeds maximum limit of {config.MAX_MESSAGE_LENGTH} characters."
            }), 400

        result = response_router.process_message(
            session_id=session_id,
            user_message=message_text,
            language=language,
            temperature=temperature
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "session_id": session_id if 'session_id' in locals() else None,
            "error": "An internal server error occurred."
        }), 500
