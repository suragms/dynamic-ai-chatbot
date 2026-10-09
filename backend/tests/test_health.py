import pytest
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

def test_health_check_endpoint(client):
    """Test health check returns status 200 and expected JSON fields."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "gemini_api_configured" in data
    assert "intent_model_loaded" in data
    assert "confidence_threshold" in data
