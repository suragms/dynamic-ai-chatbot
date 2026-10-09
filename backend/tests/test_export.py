import pytest
import uuid
from backend.app import create_app
from backend.database import db
from backend.models import Conversation, Message

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    session_id = f"export-session-{uuid.uuid4()}"
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            conv = Conversation(session_id=session_id)
            db.session.add(conv)
            db.session.commit()

            msg = Message(
                conversation_id=conv.id,
                role="user",
                content="Export test message",
                intent="general_question",
                intent_confidence=0.8,
                sentiment="neutral",
                sentiment_score=0.0,
                response_time_ms=100,
                provider="Local Fallback"
            )
            db.session.add(msg)
            db.session.commit()
            client.test_session_id = session_id
            yield client
            db.session.remove()
            db.drop_all()

def test_export_json(client):
    response = client.post("/api/export", json={"session_id": client.test_session_id, "format": "json"})
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    data = response.get_json()
    assert "messages" in data

def test_export_csv(client):
    response = client.post("/api/export", json={"session_id": client.test_session_id, "format": "csv"})
    assert response.status_code == 200
    assert "text/csv" in response.headers["Content-Type"]

def test_export_txt(client):
    response = client.post("/api/export", json={"session_id": client.test_session_id, "format": "txt"})
    assert response.status_code == 200
    assert "text/plain" in response.headers["Content-Type"]
