from datetime import datetime, timezone
import json
from backend.config import config
from backend.database import db
from backend.models.conversation import Conversation
from backend.models.message import Message

class MemoryService:
    """
    Contextual Conversation Memory Service.
    Maintains conversation session history with sliding window constraint (MAX_CONTEXT_MESSAGES=20).
    Persists history to database.
    """

    def get_or_create_conversation(self, session_id: str) -> Conversation:
        """Retrieves existing conversation by session_id or creates a new one."""
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            conversation = Conversation(session_id=session_id)
            db.session.add(conversation)
            db.session.commit()
        return conversation

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: str = None,
        intent_confidence: float = None,
        sentiment: str = None,
        sentiment_score: float = None,
        entities: list = None,
        response_time_ms: int = None,
        provider: str = None
    ) -> Message:
        """Saves a message to the database for the given session_id."""
        conversation = self.get_or_create_conversation(session_id)

        entities_json = json.dumps(entities) if entities else "[]"

        message = Message(
            conversation_id=conversation.id,
            role=role,
            content=content,
            intent=intent,
            intent_confidence=intent_confidence,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            entities=entities_json,
            response_time_ms=response_time_ms,
            provider=provider,
            timestamp=datetime.now(timezone.utc)
        )

        db.session.add(message)
        conversation.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return message

    def get_history(self, session_id: str, max_messages: int = None) -> list[dict]:
        """
        Retrieves recent message history for a session_id up to max_messages limit.
        """
        if max_messages is None:
            max_messages = config.MAX_CONTEXT_MESSAGES

        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return []

        messages = Message.query.filter_by(conversation_id=conversation.id)\
            .order_by(Message.timestamp.desc())\
            .limit(max_messages)\
            .all()

        messages.reverse()  # Chronological order
        return [m.to_dict() for m in messages]

    def clear_history(self, session_id: str) -> bool:
        """Deletes all messages for a specific session_id."""
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if conversation:
            Message.query.filter_by(conversation_id=conversation.id).delete()
            db.session.delete(conversation)
            db.session.commit()
            return True
        return False

memory_service = MemoryService()
