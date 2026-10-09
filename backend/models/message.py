from datetime import datetime, timezone
import json
from backend.database import db

class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50), nullable=True)
    intent_confidence = db.Column(db.Float, nullable=True)
    sentiment = db.Column(db.String(20), nullable=True)
    sentiment_score = db.Column(db.Float, nullable=True)
    entities = db.Column(db.Text, nullable=True)  # Stored as JSON string
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    response_time_ms = db.Column(db.Integer, nullable=True)
    provider = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        parsed_entities = []
        if self.entities:
            try:
                parsed_entities = json.loads(self.entities)
            except Exception:
                parsed_entities = []

        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "intent": self.intent,
            "intent_confidence": self.intent_confidence,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "entities": parsed_entities,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "response_time_ms": self.response_time_ms,
            "provider": self.provider
        }
