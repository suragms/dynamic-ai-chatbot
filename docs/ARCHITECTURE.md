# Dynamic AI Chatbot - System Architecture & Technical Specification

## 1. System Overview

The **Dynamic AI Chatbot** is an enterprise-grade conversational AI platform built with a modern, decoupled micro-service architecture. It combines Natural Language Processing (NLP), Machine Learning (ML) intent classification, Named Entity Recognition (NER), Sentiment Analysis, Contextual Conversation Memory, a 5-Tier Response Router, Google Gemini Generative AI, Multilingual Support (English, Hindi, Hinglish), Browser-based Voice I/O, an Analytics Dashboard, and a modern React + TypeScript + Tailwind CSS interface.

```mermaid
graph TD
    User([User]) <-->|Speech / Text| FE[React 18 + Vite + TS Frontend]
    FE <-->|REST API JSON /api/*| Flask[Flask 3.0+ REST Backend]
    
    subgraph "Backend Core Services"
        Flask --> NLP[NLP Preprocessor: NLTK Lemmatizer & Tokenizer]
        NLP --> Intent[Intent Service: Linear SVM Classifier]
        NLP --> Sentiment[Sentiment Service: NLTK VADER]
        NLP --> NER[NER Service: spaCy en_core_web_sm]
        
        Intent --> Router[5-Tier Response Router]
        Sentiment --> Router
        NER --> Router
        
        Router <--> Memory[Context Memory Service: Sliding Window]
        Memory <--> DB[(SQLite / SQLAlchemy ORM)]
    end
    
    subgraph "Response Generation Tiers"
        Router -->|Tier 1: High-Confidence Deterministic| T1[Deterministic Intent Handlers]
        Router -->|Tier 2: High-Confidence Technical FAQ| T2[Predefined Domain FAQ Engine]
        Router -->|Tier 3: Generative AI Request| T3[Google Gemini 1.5 Flash REST API]
        Router -->|Tier 4: Moderate Confidence Fallback| T4[Local NLP ML Engine]
        Router -->|Tier 5: Friendly Default| T5[Multilingual Local Fallback]
    end

    subgraph "Analytics & Management"
        Flask --> Analytics[Analytics Service: Aggregates & KPIs]
        Analytics <--> DB
        Flask --> Export[Export Service: JSON, CSV, TXT]
        Export <--> DB
    end
```

---

## 2. End-to-End Conversational Workflow

When a user submits a query through text input or speech recognition, the backend processes it through a strict analytical pipeline before routing to the optimal response generator:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant FE as React Frontend
    participant API as Flask API (/api/chat)
    participant NLP as Preprocessor & NLP Services
    participant Mem as Memory Service & SQLite
    participant Router as Response Router
    participant LLM as Google Gemini API

    User->>FE: Inputs message (or speaks via Web Speech API)
    FE->>API: POST /api/chat {message, session_id, language, temperature}
    API->>API: Validate input (non-empty, max 4000 chars)
    API->>NLP: Tokenize, clean & lemmatize input
    NLP->>NLP: Predict Intent & Confidence (Linear SVM)
    NLP->>NLP: Analyze Sentiment & Score (NLTK VADER)
    NLP->>NLP: Extract Named Entities (spaCy)
    API->>Mem: Persist user message to DB
    API->>Mem: Retrieve recent context history (max 20 messages)
    API->>Router: Route query with context & metadata
    
    alt Confidence >= 0.60 & Deterministic Intent
        Router-->>API: Return Deterministic response (Tier 1)
    else Confidence >= 0.60 & FAQ Intent
        Router-->>API: Return Technical FAQ response (Tier 2)
    else Generative Path
        Router->>LLM: Generate with dynamic system prompt & context
        alt LLM Success
            LLM-->>Router: Generative response (Tier 3)
        else LLM Fails / No Key (Confidence >= 0.40)
            Router-->>API: Return Local NLP prediction (Tier 4)
        else LLM Fails / No Key (Confidence < 0.40)
            Router-->>API: Return Friendly Localized Fallback (Tier 5)
        end
    end
    
    API->>Mem: Persist assistant message with latency & provider to DB
    API-->>FE: Return JSON {message, analysis, performance, provider}
    FE-->>User: Render message bubble with sentiment/intent badges & TTS option
```

---

## 3. Backend Architecture & Components

### 3.1 Security & Configuration Layer (`backend/config.py`)
- **Zero Secrets Mandate**: API keys (`GOOGLE_API_KEY`), secret keys (`SECRET_KEY`), and database connection parameters are loaded via `python-dotenv` from `.env`.
- **Environment Fallback**: If `GOOGLE_API_KEY` is not present, the application operates in 100% offline local fallback mode without throwing exceptions or crashing.
- **Configurable Limits**:
  - `MAX_MESSAGE_LENGTH = 4000`: Protects backend from oversized prompt buffer exhaustion.
  - `MAX_CONTENT_LENGTH = 1048576`: 1 MB HTTP payload ceiling preventing denial-of-service memory spikes.
  - `INTENT_CONFIDENCE_THRESHOLD = 0.60`: Threshold separating deterministic intent execution from generative routing.
  - `MAX_CONTEXT_MESSAGES = 20`: Context window boundary preventing context bloat.

### 3.2 Database Layer (`backend/database.py`, `backend/models/`)
The database uses SQLAlchemy with SQLite (`backend/chatbot.db`), with support for external relational databases (PostgreSQL, MySQL) via `DATABASE_URL`.

```mermaid
erDiagram
    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION {
        int id PK
        string session_id UK "Indexed UUID"
        datetime created_at
        datetime updated_at
    }
    MESSAGE {
        int id PK
        int conversation_id FK
        string role "user or assistant"
        text content "Message body"
        string intent "Detected intent"
        float intent_confidence
        string sentiment "positive, neutral, negative"
        float sentiment_score
        text entities "JSON string of entities"
        int response_time_ms "Latency in milliseconds"
        string provider "Gemini AI, Intent Handler, FAQ Engine, Local Fallback"
        datetime timestamp
    }
    ANALYTICS_EVENT {
        int id PK
        string event_type
        string session_id
        text metadata "JSON string"
        datetime timestamp
    }
```

### 3.3 NLP Pipeline (`backend/nlp/`, `backend/services/`)
1. **Preprocessor (`backend/nlp/preprocessor.py`)**:
   - Tokenization via `nltk.word_tokenize`.
   - Lowercasing and whitespace normalization.
   - Punctuation stripping with alphanumerical retention.
   - Lemmatization via `nltk.WordNetLemmatizer` (mapping nouns, verbs, adjectives).
2. **Intent Recognition (`backend/services/intent_service.py`)**:
   - TF-IDF Vectorization with unigrams and bigrams (`ngram_range=(1, 2)`), sublinear TF scaling.
   - Linear SVM classifier (`SGDClassifier(loss='log_loss', penalty='l2')`).
   - Calibrated probability estimates for confidence scoring.
   - Multi-language localized response dictionary for deterministic intents in English, Hindi, and Hinglish.
3. **Sentiment Analysis (`backend/services/sentiment_service.py`)**:
   - NLTK VADER (`SentimentIntensityAnalyzer`).
   - Generates compound score normalized to `[-1.0, 1.0]` and rescaled to `[0.0, 1.0]`.
   - Discrete classification: Positive (compound >= 0.05), Negative (compound <= -0.05), Neutral (otherwise).
   - Generates empathetic tone prefixes (e.g., "I'm sorry to hear that. Let me help you with this:") when negative user sentiment is detected.
4. **Named Entity Recognition (`backend/services/ner_service.py`)**:
   - spaCy `en_core_web_sm` pipeline.
   - Extracts `PERSON`, `ORG`, `GPE`, `DATE`, `TIME`, `MONEY`, `PRODUCT`, `EVENT`.
   - Rule-based regex fallback for email addresses, dates, and currency when spaCy is unavailable.
5. **Context Memory (`backend/services/memory_service.py`)**:
   - Chronological sliding window retrieving up to `MAX_CONTEXT_MESSAGES=20`.
   - Preserves multi-turn state across user interactions.

### 3.4 5-Tier Response Router Hierarchy (`backend/services/response_router.py`)

```mermaid
flowchart TD
    Start[User Query Received] --> Predict[Predict Intent & Confidence]
    Predict --> CheckDet{Confidence >= 0.60 &<br/>Deterministic Intent?}
    
    CheckDet -->|Yes| T1[Tier 1: Intent Handler<br/>Instant Response in selected language]
    CheckDet -->|No| CheckFAQ{Confidence >= 0.60 &<br/>FAQ Domain Intent?}
    
    CheckFAQ -->|Yes| T2[Tier 2: FAQ Engine<br/>Technical Domain Response]
    CheckFAQ -->|No| CallLLM[Attempt Tier 3: Google Gemini API]
    
    CallLLM --> LLMSuccess{Gemini API<br/>Succeeded?}
    LLMSuccess -->|Yes| T3[Tier 3: Gemini Generative AI<br/>Contextual & Empathetic Response]
    LLMSuccess -->|No / Unconfigured| CheckLocal{Confidence >= 0.40?}
    
    CheckLocal -->|Yes| T4[Tier 4: Local NLP Model<br/>Template + Local Notice]
    CheckLocal -->|No| T5[Tier 5: Friendly Fallback<br/>Localized Default Help Message]
```

---

## 4. Frontend Architecture (`frontend/src/`)

The user interface is built as a single-page React 18 application with Vite, TypeScript, and Tailwind CSS.

### Component Structure
- **`App.tsx`**: Application state controller, theme manager (`light` / `dark` / `system`), active modal coordinator.
- **`Header.tsx`**: Navigation bar, live backend health status badge, language switcher dropdown, analytics toggle, settings button.
- **`ChatContainer.tsx`**:
  - `MessageList.tsx`: Auto-scrolling feed of conversation messages with date separators.
  - `MessageItem.tsx`: Role avatar (Bot/User), message text, copy button, Text-to-Speech button, regenerate button, intent badge with confidence %, sentiment badge, entity tags, latency badge, and provider tag.
  - `QuickSuggestions.tsx`: Suggested starter queries ("Explain Machine Learning", "What can you do?", "Help with Python", "Analyze my sentiment").
  - `ChatInput.tsx`: Auto-resizing textarea, Enter-to-send (Shift+Enter for newline), speech recognition toggle with live listening animation, clear chat, and export triggers.
- **`AnalyticsDashboard.tsx`**:
  - 5 KPI summary cards: Total Conversations, Total Messages, Avg Response Time, API Success Rate, Fallback Rate.
  - 6 Recharts interactive visualizations:
    1. Messages over Time (Area Chart)
    2. Sentiment Distribution (Pie Chart with Legend)
    3. Top Intent Distribution (Bar Chart)
    4. Response Time Latency Trend (Line Chart)
    5. Provider Call Distribution (Bar / Pie Chart)
    6. Multilingual Usage Distribution (Donut Chart)
- **`AppSettingsModal.tsx`**:
  - Theme mode selector (Light, Dark, System).
  - Language selector (English, Hindi, Hinglish).
  - AI Creativity Temperature slider (`0.1` - `1.0`).
  - Feature toggles: Timestamps, Sentiment Badges, Sound Effects.
  - Quick action buttons: Clear Chat, Export Chat (JSON, CSV, TXT).

### Voice Architecture (`useVoice.ts`)
- **Speech-to-Text (STT)**: Uses browser `webkitSpeechRecognition` / `SpeechRecognition` with dynamic language mapping (`en-US`, `hi-IN`). Microphone access is entirely optional; if unsupported or denied, a dismissible alert banner appears without crashing the UI.
- **Text-to-Speech (TTS)**: Uses `window.speechSynthesis` with text cleaning (strips markdown formatting characters) to read bot responses aloud in the active language.

---

## 5. Security & Isolation Architecture

1. **Input Sanitization**: Strings stripped of invalid controls, max character length of 4000 enforced at endpoint entry.
2. **Payload Ceiling**: Flask `MAX_CONTENT_LENGTH` set to 1 MB.
3. **ORM Parameterization**: 100% of database queries execute through SQLAlchemy ORM parameter binding, eliminating SQL injection.
4. **XSS Protection**: React virtual DOM automatically escapes all text nodes. `dangerouslySetInnerHTML` is completely forbidden across the frontend codebase.
5. **No Secret Leakage**:
   - `GOOGLE_API_KEY` never returned in HTTP responses or bundled in client scripts.
   - Uncaught exceptions caught by custom error handlers returning clean JSON without stack traces.
6. **CORS Isolation**: Configurable `CORS_ORIGINS` environment variable allowing explicit origin whitelists.
