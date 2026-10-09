from backend.nlp.preprocessor import preprocessor
from backend.services.intent_service import intent_service
from backend.services.sentiment_service import sentiment_service
from backend.services.ner_service import ner_service

def test_preprocessor_pipeline():
    raw_text = "  Hello World! Testing NLP Preprocessing... 123  "
    clean = preprocessor.clean_text(raw_text)
    assert clean == "Hello World! Testing NLP Preprocessing... 123"

    processed = preprocessor.preprocess("Hello! How are you doing today?")
    assert isinstance(processed, str)
    assert len(processed) > 0

def test_intent_classification():
    res = intent_service.predict_intent("Hello good morning")
    assert "intent" in res
    assert "confidence" in res
    assert isinstance(res["intent"], str)
    assert isinstance(res["confidence"], float)

def test_sentiment_analysis():
    pos_res = sentiment_service.analyze("I love this chatbot, it is wonderful and amazing!")
    assert "label" in pos_res
    assert "score" in pos_res
    assert pos_res["label"] == "positive"
    assert pos_res["score"] > 0.5

    neg_res = sentiment_service.analyze("This is terrible, bad, awful and wrong!")
    assert "label" in neg_res
    assert "score" in neg_res
    assert neg_res["label"] == "negative"

def test_ner_extraction():
    entities = ner_service.extract_entities("Book a meeting with Rahul in Kochi tomorrow.")
    assert isinstance(entities, list)
    if len(entities) > 0:
        ent = entities[0]
        assert "entity" in ent
        assert "entity_type" in ent
        assert "start" in ent
        assert "end" in ent
