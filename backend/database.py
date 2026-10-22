from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        import backend.models  # Registers Conversation, Message, AnalyticsEvent
        db.create_all()
        try:
            from backend.seed_data import seed_analytics_data
            seed_analytics_data(force=False)
        except Exception as e:
            app.logger.warning(f"Could not auto-seed database: {e}")
