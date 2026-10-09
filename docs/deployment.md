# Deployment & Setup Guide

This guide outlines step-by-step instructions for running, testing, building, and deploying the **Dynamic AI Chatbot** application in development and production environments.

---

## 1. Prerequisites
- **Python**: Version 3.10+ (Python 3.11 or 3.14 supported).
- **Node.js**: Version 18.x or 20.x+.
- **npm** or **yarn**.

---

## 2. Environment Configuration
Copy `.env.example` to create a local `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=5000
HOST=0.0.0.0
FLASK_ENV=development
DATABASE_URL=sqlite:///backend/chatbot.db
INTENT_CONFIDENCE_THRESHOLD=0.60
MAX_CONTEXT_MESSAGES=20
```

> **Note**: If `GOOGLE_API_KEY` is not provided or remains empty, the application will automatically enter **Local NLP / FAQ Fallback Mode**, ensuring all core chat features work seamlessly without external API dependencies.

---

## 3. Backend Setup & Model Training

1. **Install Python Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Download spaCy Language Model**:
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Train the ML Intent Classifier**:
   ```bash
   python -m backend.training.train_intent_model
   ```
   This generates `models/intent_model.pkl` and `models/intent_model_metrics.json`.

4. **Generate Evaluation Documentation**:
   ```bash
   python -m backend.training.evaluate_intent_model
   ```

5. **Run Automated Test Suite**:
   ```bash
   python -m pytest backend/tests/
   ```

6. **Start Flask Development Backend Server**:
   ```bash
   python backend/app.py
   ```
   The backend REST API will be available at `http://localhost:5000`.

---

## 4. Frontend Setup & Development

1. **Navigate to `frontend/` directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The Vite dev server will run at `http://localhost:5173`.

---

## 5. Production Build & Single-Port Deployment

To bundle the application for production deployment served directly from Flask on a single port:

1. **Build Frontend Bundle**:
   ```bash
   cd frontend
   npm run build
   ```
   This compiles the optimized production build into `frontend/dist/`.

2. **Run Integrated Flask Server**:
   ```bash
   cd ..
   python backend/app.py
   ```
   Flask will automatically detect `frontend/dist/` and serve both the REST API (`/api/*`) and the frontend single-page application on `http://localhost:5000`.
