from datetime import datetime, timezone
import json
from backend.database import db

class AnalyticsEvent(db.Model):
    __tablename__ = "analytics_events"

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False, index=True)
    session_id = db.Column(db.String(100), nullable=True, index=True)
    metadata_json = db.Column(db.Text, nullable=True)  # Stored as JSON string
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        parsed_metadata = {}
        if self.metadata_json:
            try:
                parsed_metadata = json.loads(self.metadata_json)
            except Exception:
                parsed_metadata = {}

        return {
            "id": self.id,
            "event_type": self.event_type,
            "session_id": self.session_id,
            "metadata": parsed_metadata,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
