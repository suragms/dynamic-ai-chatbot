import time
from backend.config import config
from backend.services.intent_service import intent_service
from backend.services.sentiment_service import sentiment_service
from backend.services.ner_service import ner_service
from backend.services.memory_service import memory_service
from backend.services.llm_service import llm_service

class ResponseRouter:
    """
    Intelligent Response Router.
    Follows a strict multi-tier fallback architecture:
    1. Known Intent Response (Deterministic Intents)
    2. FAQ Response (Domain Specific Predefined Templates)
    3. Gemini Generative AI Engine (Google Gemini REST API)
    4. Local NLP Response (Machine Learning Intent Classifier)
    5. Friendly Fallback Response (Safe Default Message)
    """

    DETERMINISTIC_INTENTS = {
        "greeting", "goodbye", "thanks", "capabilities",
        "weather", "time", "date", "account_help"
    }

    FAQ_INTENTS = {
        "python", "machine_learning", "data_science", "technical_question"
    }

    def process_message(
        self,
        session_id: str,
        user_message: str,
        language: str = "en",
        temperature: float = 0.7
    ) -> dict:
        start_time = time.time()

        if not user_message or not user_message.strip():
            return {
                "success": False,
                "session_id": session_id,
                "error": "Empty message received.",
                "message": {"role": "assistant", "content": "Please enter a message."},
                "analysis": {"intent": "unknown", "intent_confidence": 0.0, "sentiment": "neutral", "sentiment_score": 0.5, "entities": []},
                "intent": "unknown",
                "intent_confidence": 0.0,
                "sentiment": "neutral",
                "sentiment_score": 0.5,
                "entities": [],
                "performance": {"response_time_ms": 0},
                "response_time_ms": 0,
                "provider": "Router"
            }

        # 1. Intent Recognition
        intent_res = intent_service.predict_intent(user_message)
        intent = intent_res["intent"]
        confidence = intent_res["confidence"]

        # 2. Sentiment Analysis
        sentiment_res = sentiment_service.analyze(user_message)
        sentiment = sentiment_res.get("label", sentiment_res.get("sentiment", "neutral"))
        sentiment_score = sentiment_res.get("score", 0.5)

        # 3. Named Entity Recognition
        entities = ner_service.extract_entities(user_message)

        # 4. Save User Message to Memory
        memory_service.add_message(
            session_id=session_id,
            role="user",
            content=user_message,
            intent=intent,
            intent_confidence=confidence,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            entities=entities
        )

        # 5. Retrieve recent context history
        history = memory_service.get_history(session_id, max_messages=config.MAX_CONTEXT_MESSAGES)
        llm_history = [h for h in history if h.get("content") != user_message or h.get("role") != "user"]

        response_text = ""
        provider_used = "Local Fallback"

        # 6. Fallback Hierarchy Routing
        # Tier 1: Known Intent Response (High Confidence Deterministic Intent)
        if confidence >= config.INTENT_CONFIDENCE_THRESHOLD and intent in self.DETERMINISTIC_INTENTS:
            base_reply = intent_service.get_intent_response(intent, language=language)
            tone_prefix = sentiment_service.get_tone_prefix(sentiment) if sentiment == "negative" else ""
            response_text = f"{tone_prefix} {base_reply}".strip()
            provider_used = "Intent Handler"

        # Tier 2: FAQ Response (Known Technical Domain / FAQ Intent)
        elif confidence >= config.INTENT_CONFIDENCE_THRESHOLD and intent in self.FAQ_INTENTS:
            base_reply = intent_service.get_intent_response(intent, language=language)
            response_text = base_reply
            provider_used = "FAQ Engine"

        # Tier 3 & 4: Generative LLM (Gemini API) OR Local Model Fallback
        else:
            llm_res = llm_service.generate_response(
                prompt=user_message,
                session_id=session_id,
                language=language,
                intent=intent,
                sentiment=sentiment,
                entities=entities,
                conversation_history=llm_history,
                temperature=temperature
            )

            if llm_res["success"] and llm_res["response"]:
                response_text = llm_res["response"]
                provider_used = llm_res["provider"]
            else:
                # Tier 4: Local Response (Moderate confidence local intent prediction)
                if confidence >= 0.40:
                    base_reply = intent_service.get_intent_response(intent, language=language)
                    response_text = f"{base_reply}\n\n*(Note: Answering via local NLP engine)*"
                    provider_used = "Local NLP Model"
                # Tier 5: Friendly Fallback
                else:
                    if language == "hi":
                        response_text = (
                            "क्षमा करें, मैं अभी इस अनुरोध को पूरी तरह से संसाधित नहीं कर सका। "
                            "मैं पायथन, मशीन लर्निंग या डेटा साइंस के बारे में प्रश्नों में आपकी सहायता कर सकता हूँ!"
                        )
                    elif language == "hinglish":
                        response_text = (
                            "Sorry, main abhi aapke request ko fully process nahi kar paya. "
                            "Main Python, Machine Learning, ya Data Science ke questions mein aapki help kar sakta hoon! "
                            "Kya aap apna prompt rephrase kar sakte hain?"
                        )
                    else:
                        response_text = (
                            "I'm sorry, I couldn't fully process that request right now. "
                            "I can help answer questions about Python, Machine Learning, Data Science, or system features! "
                            "Could you please try rephrasing your prompt?"
                        )
                    provider_used = "Friendly Fallback"

        response_time_ms = int((time.time() - start_time) * 1000)

        # 7. Save Assistant Response to Memory
        memory_service.add_message(
            session_id=session_id,
            role="assistant",
            content=response_text,
            intent=intent,
            intent_confidence=confidence,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            entities=entities,
            response_time_ms=response_time_ms,
            provider=provider_used
        )

        return {
            "success": True,
            "session_id": session_id,
            "message": {
                "role": "assistant",
                "content": response_text
            },
            "analysis": {
                "intent": intent,
                "intent_confidence": confidence,
                "sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "entities": entities
            },
            "intent": intent,
            "intent_confidence": confidence,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "entities": entities,
            "performance": {
                "response_time_ms": response_time_ms
            },
            "response_time_ms": response_time_ms,
            "provider": provider_used
        }

response_router = ResponseRouter()
