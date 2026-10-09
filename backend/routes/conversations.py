from flask import Blueprint, jsonify
from backend.services.memory_service import memory_service

conversations_bp = Blueprint("conversations", __name__)

@conversations_bp.route("/api/conversations/<session_id>", methods=["GET"])
def get_conversation(session_id):
    """Retrieve full chronological conversation history for a given session_id."""
    history = memory_service.get_history(session_id, max_messages=100)
    return jsonify({
        "success": True,
        "session_id": session_id,
        "count": len(history),
        "messages": history
    }), 200

@conversations_bp.route("/api/conversations/<session_id>", methods=["DELETE"])
def delete_conversation(session_id):
    """Clear and delete all stored messages for a session_id."""
    cleared = memory_service.clear_history(session_id)
    return jsonify({
        "success": cleared,
        "session_id": session_id,
        "message": "Conversation history cleared successfully." if cleared else "Session ID not found."
    }), 200 if cleared else 404
