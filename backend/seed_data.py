from datetime import datetime, timezone, timedelta
import random
import json
from backend.database import db
from backend.models.conversation import Conversation
from backend.models.message import Message
from backend.models.analytics import AnalyticsEvent

SAMPLE_CONVERSATIONS = [
    {
        "session_id": "seed-session-101",
        "days_ago": 6,
        "dialogue": [
            ("user", "Hello! What can you do?", "greeting", 0.98, "positive", 0.65, ["greeting"]),
            ("assistant", "Hello! I am Dynamic AI, an intelligent conversational assistant powered by Google Gemini and local NLP models. I can assist with machine learning, coding in Python, data analysis, and answering complex questions.", None, None, None, None, None, "Gemini 3.5 Flash", 420),
            ("user", "Explain machine learning in simple words.", "ai_ml_inquiry", 0.95, "neutral", 0.20, ["machine learning"]),
            ("assistant", "Machine learning is a field of artificial intelligence where computers learn patterns from experience and data, rather than following static rule-based instructions.", None, None, None, None, None, "Gemini 3.5 Flash", 510),
        ]
    },
    {
        "session_id": "seed-session-102",
        "days_ago": 5,
        "dialogue": [
            ("user", "Write a Python function to check for prime numbers.", "code_assistance", 0.92, "neutral", 0.05, ["python", "prime numbers"]),
            ("assistant", "```python\ndef is_prime(n: int) -> bool:\n    if n <= 1:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n```", None, None, None, None, None, "Gemini 3.5 Flash", 380),
            ("user", "That works perfectly, thank you!", "greeting", 0.90, "positive", 0.88, ["feedback"]),
            ("assistant", "You're very welcome! Let me know if you need any unit tests or performance optimizations for it.", None, None, None, None, None, "Gemini 3.5 Flash", 290),
        ]
    },
    {
        "session_id": "seed-session-103",
        "days_ago": 5,
        "dialogue": [
            ("user", "How does sentiment analysis work in NLP?", "ai_ml_inquiry", 0.94, "positive", 0.40, ["nlp", "sentiment analysis"]),
            ("assistant", "Sentiment analysis evaluates text using tokenization, lexicon lexicons (like VADER), or transformer neural networks to classify emotional polarity as positive, neutral, or negative.", None, None, None, None, None, "Gemini 3.5 Flash", 580),
        ]
    },
    {
        "session_id": "seed-session-104",
        "days_ago": 4,
        "dialogue": [
            ("user", "How do I reverse a string in Python?", "python_help", 0.96, "neutral", 0.10, ["python", "string"]),
            ("assistant", "In Python, the most idiomatic way is string slicing: `reversed_str = original_str[::-1]`.", None, None, None, None, None, "Gemini 3.5 Flash", 310),
            ("user", "What about using reversed() join?", "python_help", 0.91, "neutral", 0.05, ["python"]),
            ("assistant", "You can also use `''.join(reversed(original_str))`. Slicing `[::-1]` is slightly faster in CPython because it runs in optimized C code.", None, None, None, None, None, "Gemini 3.5 Flash", 340),
        ]
    },
    {
        "session_id": "seed-session-105",
        "days_ago": 4,
        "dialogue": [
            ("user", "I am having trouble with a connection timeout error.", "technical_troubleshooting", 0.88, "negative", -0.55, ["troubleshooting", "error"]),
            ("assistant", "Connection timeouts typically occur due to firewall rules, incorrect host/port configuration, or server resource bottlenecks. Check your network configuration and verify the server is listening.", None, None, None, None, None, "Gemini 3.5 Flash", 620),
        ]
    },
    {
        "session_id": "seed-session-106",
        "days_ago": 3,
        "dialogue": [
            ("user", "What is deep learning vs machine learning?", "ai_ml_inquiry", 0.97, "neutral", 0.15, ["deep learning", "machine learning"]),
            ("assistant", "Machine learning covers all algorithms that parse data and learn patterns. Deep learning is a specialized subset of ML using deep multi-layer neural networks capable of learning features directly from raw inputs like images and audio.", None, None, None, None, None, "Gemini 3.5 Flash", 690),
            ("user", "Which one is better for small tabular datasets?", "ai_ml_inquiry", 0.93, "positive", 0.35, ["tabular", "ml"]),
            ("assistant", "For tabular data with limited samples, traditional machine learning models like XGBoost, LightGBM, and Random Forests almost always outperform deep neural networks.", None, None, None, None, None, "Gemini 3.5 Flash", 430),
        ]
    },
    {
        "session_id": "seed-session-107",
        "days_ago": 3,
        "dialogue": [
            ("user", "Hi, are you online?", "greeting", 0.99, "positive", 0.50, ["greeting"]),
            ("assistant", "Yes! I am online, ready to help you with anything.", None, None, None, None, None, "Local NLP Fallback", 48),
        ]
    },
    {
        "session_id": "seed-session-108",
        "days_ago": 2,
        "dialogue": [
            ("user", "Can you explain backpropagation in neural networks?", "ai_ml_inquiry", 0.96, "positive", 0.30, ["neural networks", "backpropagation"]),
            ("assistant", "Backpropagation computes the gradient of the loss function with respect to each weight using the mathematical chain rule of calculus, flowing backwards from output to input.", None, None, None, None, None, "Gemini 3.5 Flash", 740),
            ("user", "That explanation is really clear!", "greeting", 0.91, "positive", 0.92, ["compliment"]),
            ("assistant", "I'm glad that helped! Mathematics is easier when broken down step-by-step.", None, None, None, None, None, "Gemini 3.5 Flash", 260),
        ]
    },
    {
        "session_id": "seed-session-109",
        "days_ago": 2,
        "dialogue": [
            ("user", "How to write a binary search algorithm in Python?", "code_assistance", 0.95, "neutral", 0.0, ["python", "binary search"]),
            ("assistant", "```python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n```", None, None, None, None, None, "Gemini 3.5 Flash", 410),
        ]
    },
    {
        "session_id": "seed-session-110",
        "days_ago": 1,
        "dialogue": [
            ("user", "Analyze the sentiment of this text: 'The new user interface looks fantastic and works seamlessly!'", "sentiment_analysis", 0.98, "positive", 0.96, ["sentiment"]),
            ("assistant", "The detected sentiment is **Strongly Positive** with a confidence score of 0.96. The words 'fantastic' and 'seamlessly' express high satisfaction.", None, None, None, None, None, "Gemini 3.5 Flash", 360),
            ("user", "What if I say: 'The loading delay is terrible'?", "sentiment_analysis", 0.97, "negative", -0.85, ["sentiment"]),
            ("assistant", "That text registers as **Negative** (-0.85 polarity) due to the strongly critical adjective 'terrible'.", None, None, None, None, None, "Gemini 3.5 Flash", 330),
        ]
    },
    {
        "session_id": "seed-session-111",
        "days_ago": 1,
        "dialogue": [
            ("user", "What are list comprehensions in Python?", "python_help", 0.94, "neutral", 0.10, ["python", "list comprehension"]),
            ("assistant", "List comprehensions provide a concise way to create lists: `squares = [x**2 for x in range(10) if x % 2 == 0]`.", None, None, None, None, None, "Gemini 3.5 Flash", 305),
        ]
    },
    {
        "session_id": "seed-session-112",
        "days_ago": 0,
        "dialogue": [
            ("user", "Hello Dynamic AI! Can you tell me what models power you?", "ai_ml_inquiry", 0.94, "positive", 0.70, ["models", "gemini"]),
            ("assistant", "I am powered by Google Gemini 3.5 Flash for high-speed multimodal reasoning, accompanied by local Scikit-Learn NLP models and intent classifiers for high-availability offline fallback.", None, None, None, None, None, "Gemini 3.5 Flash", 390),
            ("user", "Give me a quick SQL query example with GROUP BY and HAVING.", "code_assistance", 0.96, "neutral", 0.05, ["sql", "database"]),
            ("assistant", "```sql\nSELECT department_id, COUNT(*) as employee_count, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5\nORDER BY avg_salary DESC;\n```", None, None, None, None, None, "Gemini 3.5 Flash", 450),
            ("user", "Awesome, thanks!", "greeting", 0.95, "positive", 0.85, ["appreciation"]),
            ("assistant", "Anytime! Have a productive day coding.", None, None, None, None, None, "Gemini 3.5 Flash", 220),
        ]
    },
    {
        "session_id": "seed-session-113",
        "days_ago": 0,
        "dialogue": [
            ("user", "Quick ping check.", "greeting", 0.85, "neutral", 0.0, ["ping"]),
            ("assistant", "Pong! Systems operational.", None, None, None, None, None, "Local NLP Fallback", 42),
        ]
    }
]

def seed_analytics_data(force: bool = False) -> dict:
    """
    Seeds comprehensive sample conversations and messages for analytics visualization.
    If `force` is False and messages already exist, skips seeding.
    """
    existing_count = Conversation.query.count()
    if existing_count > 0 and not force:
        return {"seeded": False, "message": f"Database already has {existing_count} conversations."}

    # Clear existing if force
    if force:
        Message.query.delete()
        Conversation.query.delete()
        AnalyticsEvent.query.delete()
        db.session.commit()

    base_time = datetime.now(timezone.utc)
    seeded_convo_count = 0
    seeded_msg_count = 0

    for item in SAMPLE_CONVERSATIONS:
        session_id = item["session_id"]
        days_ago = item["days_ago"]
        convo_time = base_time - timedelta(days=days_ago, minutes=random.randint(10, 360))

        convo = Conversation(
            session_id=session_id,
            created_at=convo_time,
            updated_at=convo_time + timedelta(minutes=5)
        )
        db.session.add(convo)
        db.session.flush()
        seeded_convo_count += 1

        dialogue_time = convo_time
        for entry in item["dialogue"]:
            role = entry[0]
            content = entry[1]
            intent = entry[2]
            confidence = entry[3]
            sentiment = entry[4]
            sentiment_score = entry[5]
            entities = entry[6]
            provider = entry[7] if len(entry) > 7 else None
            resp_time = entry[8] if len(entry) > 8 else None

            dialogue_time += timedelta(seconds=random.randint(4, 18))

            msg = Message(
                conversation_id=convo.id,
                role=role,
                content=content,
                intent=intent,
                intent_confidence=confidence,
                sentiment=sentiment,
                sentiment_score=sentiment_score,
                entities=json.dumps(entities) if entities else None,
                timestamp=dialogue_time,
                response_time_ms=resp_time,
                provider=provider
            )
            db.session.add(msg)
            seeded_msg_count += 1

            # Also add an AnalyticsEvent
            event = AnalyticsEvent(
                event_type="chat_message",
                session_id=session_id,
                metadata_json=json.dumps({
                    "role": role,
                    "intent": intent,
                    "sentiment": sentiment,
                    "provider": provider,
                    "latency_ms": resp_time
                }),
                timestamp=dialogue_time
            )
            db.session.add(event)

    db.session.commit()
    return {
        "seeded": True,
        "conversations": seeded_convo_count,
        "messages": seeded_msg_count,
        "message": f"Successfully seeded {seeded_convo_count} conversations and {seeded_msg_count} messages."
    }
