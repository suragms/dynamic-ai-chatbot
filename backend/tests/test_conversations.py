import pytest
import uuid
from backend.app import create_app
from backend.database import db
from backend.models import Conversation, Message

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    session_id = f"test-uuid-{uuid.uuid4()}"
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            conv = Conversation(session_id=session_id)
            db.session.add(conv)
            db.session.commit()

            msg1 = Message(
                conversation_id=conv.id,
                role="user",
                content="Hello bot",
                intent="greeting",
                sentiment="neutral"
            )
            msg2 = Message(
                conversation_id=conv.id,
                role="assistant",
                content="Hello user!",
                intent="greeting",
                sentiment="positive"
            )
            db.session.add_all([msg1, msg2])
            db.session.commit()
            client.session_id = session_id
            yield client
            db.session.remove()
            db.drop_all()

def test_get_conversation_success(client):
    response = client.get(f"/api/conversations/{client.session_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["session_id"] == client.session_id
    assert data["count"] == 2
    assert len(data["messages"]) == 2
    assert data["messages"][0]["content"] == "Hello bot"

def test_delete_conversation_success(client):
    response = client.delete(f"/api/conversations/{client.session_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True

    # Verify history is cleared
    get_res = client.get(f"/api/conversations/{client.session_id}")
    assert get_res.get_json()["count"] == 0

def test_delete_nonexistent_conversation(client):
    non_existent = f"non-existent-{uuid.uuid4()}"
    response = client.delete(f"/api/conversations/{non_existent}")
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False

def test_404_error_handler(client):
    response = client.get("/api/invalid-endpoint-xyz")
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert data["error"] == "Resource not found"
