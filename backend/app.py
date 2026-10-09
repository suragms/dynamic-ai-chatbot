import logging
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

from backend.config import config
from backend.database import init_db
from backend.routes import chat_bp, analytics_bp, health_bp, conversations_bp, export_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend")

def create_app(test_config=None):
    """Application factory for Dynamic AI Chatbot backend."""
    # Locate static dist directory if built frontend exists
    static_folder = config.PROJECT_ROOT / "frontend" / "dist"
    app = Flask(__name__, static_folder=str(static_folder) if static_folder.exists() else None)

    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = config.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024  # 1 MB maximum payload limit

    if test_config:
        app.config.update(test_config)

    # Enable CORS
    cors_origins = config.CORS_ORIGINS.split(",") if "," in config.CORS_ORIGINS else config.CORS_ORIGINS
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # Initialize DB
    init_db(app)

    # Register API Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(conversations_bp)
    app.register_blueprint(export_bp)

    # Serve React SPA if built frontend exists
    if static_folder.exists():
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path.startswith("api/"):
                return jsonify({"success": False, "error": "Resource not found"}), 404
            if path != "" and (static_folder / path).exists():
                return send_from_directory(str(static_folder), path)
            return send_from_directory(str(static_folder), "index.html")

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def server_error(error):
        logger.error(f"Internal server error: {error}", exc_info=True)
        return jsonify({"success": False, "error": "Internal server error"}), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        logger.error(f"Unhandled exception: {error}", exc_info=True)
        return jsonify({"success": False, "error": "An unexpected error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    is_debug = config.FLASK_ENV == "development"
    logger.info(f"Starting Dynamic AI Chatbot Server on http://{config.HOST}:{config.PORT} (Debug: {is_debug})")
    app.run(host=config.HOST, port=config.PORT, debug=is_debug)
