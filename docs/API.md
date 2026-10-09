# Dynamic AI Chatbot - REST API Specification

The Dynamic AI Chatbot exposes a versionless REST HTTP API rooted under `/api`. All communication utilizes standard JSON payloads with UTF-8 encoding.

---

## Overview of Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | System health, model status, and configuration details | Public |
| `POST` | `/api/chat` | Main conversational processing and response generation | Public |
| `GET` | `/api/conversations/<session_id>` | Chronological conversation message history for a session | Public |
| `DELETE` | `/api/conversations/<session_id>` | Clears and deletes all message records for a session | Public |
| `GET` | `/api/analytics/summary` | Global conversation KPIs and performance summary | Public |
| `GET` | `/api/analytics/sentiment` | Sentiment distribution across user queries | Public |
| `GET` | `/api/analytics/intents` | Detected intent frequencies and top 5 intents | Public |
| `GET` | `/api/analytics/performance` | Latency percentiles, time trends, and provider distributions | Public |
| `POST` | `/api/export` | Exports conversation history as JSON, CSV, or TXT file | Public |

---

## 1. Health Check

Checks backend server operational status, database connectivity, ML model availability, and Gemini API configuration state.

- **URL**: `/api/health`
- **Method**: `GET`
- **Headers**: None required

### Success Response (200 OK)
```json
{
  "status": "healthy",
  "gemini_api_configured": true,
  "gemini_model": "gemini-1.5-flash",
  "intent_model_loaded": true,
  "confidence_threshold": 0.60,
  "max_context_messages": 20
}
```

---

## 2. Chat Processing

Main interaction endpoint. Executes NLP preprocessing, ML intent recognition, sentiment analysis, named entity recognition, conversation memory persistence, and dynamic 5-tier response routing.

- **URL**: `/api/chat`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

### Request Payload
```json
{
  "message": "Can you explain how logistic regression works?",
  "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
  "language": "en",
  "temperature": 0.7
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | `string` | **Yes** | — | User text input (1 to 4000 characters). |
| `session_id` | `string` | No | Auto-generated UUID | Unique conversation session identifier. |
| `language` | `string` | No | `"en"` | Target language: `"en"`, `"hi"` (Hindi), or `"hinglish"`. |
| `temperature`| `number` | No | `0.7` | Model creativity temperature (range: `0.1` to `1.0`). |

### Success Response (200 OK)
```json
{
  "success": true,
  "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
  "message": {
    "role": "assistant",
    "content": "Logistic regression is a fundamental statistical method used for binary classification tasks..."
  },
  "analysis": {
    "intent": "machine_learning",
    "intent_confidence": 0.94,
    "sentiment": "neutral",
    "sentiment_score": 0.50,
    "entities": [
      {
        "text": "logistic regression",
        "label": "CONCEPT"
      }
    ]
  },
  "intent": "machine_learning",
  "intent_confidence": 0.94,
  "sentiment": "neutral",
  "sentiment_score": 0.50,
  "entities": [],
  "performance": {
    "response_time_ms": 312
  },
  "response_time_ms": 312,
  "provider": "Gemini AI"
}
```

### Error Responses
- **400 Bad Request** (Empty message):
  ```json
  {
    "success": false,
    "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
    "error": "Message content cannot be empty."
  }
  ```
- **400 Bad Request** (Exceeds maximum characters):
  ```json
  {
    "success": false,
    "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
    "error": "Message content exceeds maximum limit of 4000 characters."
  }
  ```
- **413 Request Entity Too Large** (Exceeds 1 MB HTTP payload):
  ```json
  {
    "success": false,
    "error": "Bad request"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
    "error": "An internal server error occurred."
  }
  ```

---

## 3. Conversation Management

### 3.1 Get Conversation History
Retrieves all historical messages for a given session.

- **URL**: `/api/conversations/<session_id>`
- **Method**: `GET`

#### Success Response (200 OK)
```json
{
  "success": true,
  "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
  "count": 2,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Hello!",
      "intent": "greeting",
      "intent_confidence": 0.99,
      "sentiment": "positive",
      "sentiment_score": 0.72,
      "entities": [],
      "timestamp": "2026-10-09T10:15:30.123456"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Hello! How can I assist you today?",
      "intent": "greeting",
      "intent_confidence": 0.99,
      "sentiment": "positive",
      "sentiment_score": 0.72,
      "entities": [],
      "timestamp": "2026-10-09T10:15:30.150212",
      "response_time_ms": 27,
      "provider": "Intent Handler"
    }
  ]
}
```

### 3.2 Clear Conversation History
Deletes all stored message records for the specified session.

- **URL**: `/api/conversations/<session_id>`
- **Method**: `DELETE`

#### Success Response (200 OK)
```json
{
  "success": true,
  "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
  "message": "Conversation history cleared successfully."
}
```

#### Not Found Response (404)
```json
{
  "success": false,
  "session_id": "unknown-session-id",
  "message": "Session ID not found."
}
```

---

## 4. Analytics Endpoints

### 4.1 Global Analytics Summary
- **URL**: `/api/analytics/summary`
- **Method**: `GET`

#### Success Response (200 OK)
```json
{
  "success": true,
  "total_conversations": 42,
  "total_messages": 180,
  "user_messages": 90,
  "assistant_messages": 90,
  "avg_messages_per_session": 4.29,
  "avg_response_time_ms": 145.8,
  "api_success_rate": 96.67,
  "fallback_rate": 3.33,
  "gemini_calls": 58,
  "gemini_percentage": 64.44,
  "fallback_calls": 3,
  "fallback_percentage": 3.33,
  "intent_engine_calls": 29
}
```

### 4.2 Sentiment Breakdown
- **URL**: `/api/analytics/sentiment`
- **Method**: `GET`

#### Success Response (200 OK)
```json
{
  "success": true,
  "total_analyzed": 90,
  "distribution": {
    "positive": 48,
    "neutral": 34,
    "negative": 8
  },
  "percentages": {
    "positive": 53.33,
    "neutral": 37.78,
    "negative": 8.89
  }
}
```

### 4.3 Intent Frequency & Top Intents
- **URL**: `/api/analytics/intents`
- **Method**: `GET`

#### Success Response (200 OK)
```json
{
  "success": true,
  "total_detected": 90,
  "intents": {
    "greeting": 25,
    "python": 18,
    "machine_learning": 15,
    "technical_question": 12,
    "thanks": 10,
    "weather": 5,
    "goodbye": 5
  },
  "most_common_intents": [
    { "intent": "greeting", "count": 25, "percentage": 27.78 },
    { "intent": "python", "count": 18, "percentage": 20.00 },
    { "intent": "machine_learning", "count": 15, "percentage": 16.67 },
    { "intent": "technical_question", "count": 12, "percentage": 13.33 },
    { "intent": "thanks", "count": 10, "percentage": 11.11 }
  ]
}
```

### 4.4 Latency & Performance Trends
- **URL**: `/api/analytics/performance`
- **Method**: `GET`

#### Success Response (200 OK)
```json
{
  "success": true,
  "count": 90,
  "avg_ms": 145.8,
  "p50_ms": 95.0,
  "p95_ms": 480.0,
  "response_time_trend": [
    {
      "id": 89,
      "timestamp": "14:22:05",
      "response_time_ms": 115,
      "provider": "Gemini AI"
    }
  ],
  "messages_over_time": [
    {
      "date": "2026-10-09",
      "total": 180,
      "user": 90,
      "assistant": 90
    }
  ],
  "provider_distribution": {
    "Gemini AI": 58,
    "Intent Handler": 24,
    "FAQ Engine": 5,
    "Local Fallback": 3
  },
  "language_usage": {
    "English (en)": 72,
    "Hindi (hi)": 10,
    "Hinglish": 8
  }
}
```

---

## 5. Conversation Export

Exports the full message log for a session as a downloadable file attachment in JSON, CSV, or TXT format.

- **URL**: `/api/export`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

### Request Payload
```json
{
  "session_id": "a8f2c3d1-9b4e-4f76-8e2a-1c5d9f0e3b2a",
  "format": "json"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `session_id` | `string` | **Yes** | Active session UUID |
| `format` | `string` | No (default: `"json"`) | `"json"`, `"csv"`, or `"txt"` |

### Response Headers
- `Content-Type`: `application/json` | `text/csv` | `text/plain`
- `Content-Disposition`: `attachment;filename=chat_export_a8f2c3d1.<format>`
