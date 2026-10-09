import pytest
import uuid
from backend.app import create_app
from backend.database import db

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_chat_endpoint_basic(client):
    payload = {
        "message": "Hello, good morning!",
        "session_id": f"test-session-{uuid.uuid4()}",
        "language": "en",
        "temperature": 0.7
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert "message" in data
    assert data["message"]["role"] == "assistant"
    assert len(data["message"]["content"]) > 0
    assert "analysis" in data
    assert "intent" in data["analysis"]
    assert "sentiment" in data["analysis"]
    assert "entities" in data["analysis"]
    assert "performance" in data
    assert "provider" in data

def test_chat_endpoint_empty_message(client):
    payload = {
        "message": "   ",
        "session_id": f"test-session-{uuid.uuid4()}"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_chat_endpoint_max_length_exceeded(client):
    payload = {
        "message": "A" * 4001,
        "session_id": f"test-session-{uuid.uuid4()}"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "exceeds maximum limit" in data["error"]
