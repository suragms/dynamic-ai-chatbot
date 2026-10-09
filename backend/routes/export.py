import csv
import io
import json
from flask import Blueprint, request, jsonify, Response
from backend.services.memory_service import memory_service

export_bp = Blueprint("export", __name__)

@export_bp.route("/api/export", methods=["POST"])
def export_chat():
    """
    Exports conversation history in JSON, CSV, or TXT format.
    Payload: { "session_id": "uuid", "format": "json" | "csv" | "txt" }
    """
    data = request.get_json() or {}
    session_id = data.get("session_id")
    export_format = data.get("format", "json").lower()

    if not session_id:
        return jsonify({"success": False, "error": "session_id parameter is required."}), 400

    history = memory_service.get_history(session_id, max_messages=500)

    if export_format == "json":
        clean_data = {
            "session_id": session_id,
            "export_timestamp": history[-1]["timestamp"] if history else None,
            "message_count": len(history),
            "messages": [
                {
                    "timestamp": msg["timestamp"],
                    "role": msg["role"],
                    "content": msg["content"],
                    "intent": msg.get("intent"),
                    "sentiment": msg.get("sentiment")
                }
                for msg in history
            ]
        }
        return Response(
            json.dumps(clean_data, indent=2),
            mimetype="application/json",
            headers={"Content-Disposition": f"attachment;filename=chat_export_{session_id[:8]}.json"}
        )

    elif export_format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Timestamp", "Role", "Message", "Intent", "Sentiment"])
        for msg in history:
            writer.writerow([
                msg.get("timestamp", ""),
                msg.get("role", ""),
                msg.get("content", ""),
                msg.get("intent", ""),
                msg.get("sentiment", "")
            ])
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename=chat_export_{session_id[:8]}.csv"}
        )

    elif export_format == "txt":
        lines = [f"=== Chat History Export (Session: {session_id}) ===\n"]
        for msg in history:
            role = "User" if msg["role"] == "user" else "AI Assistant"
            lines.append(f"[{msg.get('timestamp', '')}] {role}:\n{msg.get('content', '')}\n")
        return Response(
            "\n".join(lines),
            mimetype="text/plain",
            headers={"Content-Disposition": f"attachment;filename=chat_export_{session_id[:8]}.txt"}
        )

    else:
        return jsonify({"success": False, "error": "Unsupported format. Use 'json', 'csv', or 'txt'."}), 400
