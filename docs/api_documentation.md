# REST API Documentation

The Dynamic AI Chatbot backend exposes a RESTful HTTP API under the `/api` prefix.

---

## 1. Health Check Endpoint
Returns the operational status of the server, loaded ML models, and API configurations.

- **URL**: `GET /api/health`
- **Response Headers**: `Content-Type: application/json`
- **Response Body**:
```json
{
  "status": "healthy",
  "gemini_api_configured": false,
  "gemini_model": "gemini-1.5-flash",
  "intent_model_loaded": true,
  "confidence_threshold": 0.60,
  "timestamp": "2026-10-08T15:30:00Z"
}
```

---

## 2. Chat Processing Endpoint
Main conversational endpoint. Accepts user input, performs NLP analysis (intent recognition, sentiment analysis, entity extraction), updates context memory, routes the prompt to Gemini Generative AI or local deterministic intent/fallback handlers, and returns structured analysis.

- **URL**: `POST /api/chat`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "message": "Book a flight to Kochi for Rahul tomorrow",
  "session_id": "session-uuid-12345",
  "language": "en",
  "temperature": 0.7
}
```
- **Response Body (200 OK)**:
```json
{
  "status": "success",
  "session_id": "session-uuid-12345",
  "message": {
    "role": "assistant",
    "content": "I can help with flight bookings and account inquiries!"
  },
  "analysis": {
    "intent": "general_question",
    "intent_confidence": 0.85,
    "sentiment": "positive",
    "sentiment_score": 0.76,
    "entities": [
      {"text": "Rahul", "label": "PERSON"},
      {"text": "Kochi", "label": "GPE"},
      {"text": "tomorrow", "label": "DATE"}
    ]
  },
  "performance": {
    "response_time_ms": 142
  },
  "provider": "intent_engine"
}
```

---

## 3. Conversation Context Endpoint
Retrieves or clears stored message history for a given session.

- **URL**: `GET /api/conversations/<session_id>`
- **Response Body**:
```json
{
  "success": true,
  "session_id": "session-uuid-12345",
  "count": 2,
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "intent": "greeting",
      "sentiment": "neutral",
      "timestamp": "2026-10-08T15:30:00Z"
    }
  ]
}
```

- **URL**: `DELETE /api/conversations/<session_id>`
- **Response Body**:
```json
{
  "success": true,
  "message": "Conversation history cleared successfully.",
  "session_id": "session-uuid-12345"
}
```

---

## 4. Analytics Endpoints
Provides aggregated metrics and data visualizations for the analytics dashboard.

### Summary Metrics
- **URL**: `GET /api/analytics/summary`
- **Response Body**:
```json
{
  "total_conversations": 12,
  "total_messages": 48,
  "user_messages": 24,
  "assistant_messages": 24,
  "avg_response_time_ms": 135.2,
  "api_success_rate": 100.0,
  "fallback_calls": 2
}
```

### Sentiment Distribution
- **URL**: `GET /api/analytics/sentiment`
- **Response Body**:
```json
{
  "success": true,
  "total_analyzed": 24,
  "distribution": {
    "positive": 14,
    "neutral": 8,
    "negative": 2
  },
  "percentages": {
    "positive": 58.33,
    "neutral": 33.33,
    "negative": 8.33
  }
}
```

### Top Intent Distribution
- **URL**: `GET /api/analytics/intents`
- **Response Body**:
```json
{
  "success": true,
  "total_detected": 24,
  "intents": {
    "greeting": 8,
    "general_question": 6,
    "python": 4,
    "capabilities": 3,
    "thanks": 3
  }
}
```

---

## 5. Export Endpoint
Exports conversation transcripts in JSON, CSV, or plain text format.

- **URL**: `POST /api/export`
- **Request Body**:
```json
{
  "session_id": "session-uuid-12345",
  "format": "json"
}
```
- **Response Headers**: `Content-Disposition: attachment; filename="conversation_session-uuid-12345.json"`
