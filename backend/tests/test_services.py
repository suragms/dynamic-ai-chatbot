import pytest
from backend.services.memory_service import memory_service
from backend.services.response_router import response_router
from backend.app import create_app
from backend.database import db

@pytest.fixture
def app_ctx():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

def test_memory_service(app_ctx):
    session_id = "mem-test-session"
    memory_service.add_message(session_id, "user", "Hi")
    memory_service.add_message(session_id, "assistant", "Hello there!")

    history = memory_service.get_history(session_id)
    assert len(history) == 2
    assert history[0]["content"] == "Hi"
    assert history[1]["content"] == "Hello there!"

    memory_service.clear_history(session_id)
    assert len(memory_service.get_history(session_id)) == 0

def test_response_router_fallback(app_ctx):
    res = response_router.process_message(
        session_id="route-session-1",
        user_message="Tell me a joke about programming",
        language="en",
        temperature=0.7
    )
    assert res["success"] is True
    assert "message" in res
    assert "content" in res["message"]
    assert "analysis" in res
    assert "intent" in res["analysis"]
    assert "sentiment" in res["analysis"]
    assert "entities" in res["analysis"]
    assert "provider" in res
    assert res["performance"]["response_time_ms"] >= 0
