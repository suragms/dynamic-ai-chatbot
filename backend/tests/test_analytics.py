import pytest
import uuid
from backend.app import create_app
from backend.database import db
from backend.models import Message, Conversation

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            session_id = f"analytics-session-{uuid.uuid4()}"
            conv = Conversation(session_id=session_id)
            db.session.add(conv)
            db.session.commit()

            msg1 = Message(
                conversation_id=conv.id,
                role="user",
                content="Hello",
                intent="greeting",
                intent_confidence=0.95,
                sentiment="positive",
                sentiment_score=0.8,
                response_time_ms=120,
                provider="Intent Handler"
            )
            msg2 = Message(
                conversation_id=conv.id,
                role="assistant",
                content="Hi there!",
                intent="greeting",
                intent_confidence=0.95,
                sentiment="positive",
                sentiment_score=0.8,
                response_time_ms=120,
                provider="Intent Handler"
            )
            db.session.add_all([msg1, msg2])
            db.session.commit()
            yield client
            db.session.remove()
            db.drop_all()

def test_analytics_summary(client):
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.get_json()
    assert "total_messages" in data
    assert "total_conversations" in data
    assert "avg_response_time_ms" in data
    assert data["total_messages"] >= 2

def test_analytics_sentiment(client):
    response = client.get("/api/analytics/sentiment")
    assert response.status_code == 200
    data = response.get_json()
    assert "distribution" in data
    assert "positive" in data["distribution"]

def test_analytics_intents(client):
    response = client.get("/api/analytics/intents")
    assert response.status_code == 200
    data = response.get_json()
    assert "intents" in data
    assert len(data["intents"]) > 0
