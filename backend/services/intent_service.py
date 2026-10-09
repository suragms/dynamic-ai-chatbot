import joblib
import numpy as np
import random
from backend.config import config
from backend.nlp.preprocessor import preprocessor
from backend.training.train_intent_model import train_and_evaluate_models

class IntentService:
    """Service to load trained intent model and predict intent with confidence score."""

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.intent_responses = {}
        self.load_model()

    def load_model(self):
        """Loads model artifact from disk or trains if missing."""
        if not config.MODEL_PATH.exists():
            print("[!] Intent model artifact not found. Training model now...")
            train_and_evaluate_models()

        try:
            payload = joblib.load(config.MODEL_PATH)
            self.model = payload["model"]
            self.vectorizer = payload["vectorizer"]
            self.label_encoder = payload["label_encoder"]
            self.intent_responses = payload.get("intent_responses", {})
            print(f"[+] Loaded intent model '{payload.get('model_name', 'Classifier')}' successfully.")
        except Exception as e:
            print(f"[-] Error loading intent model: {e}")
            self.model = None

    def predict_intent(self, text: str) -> dict:
        """
        Predict intent for input text.
        Returns: { 'intent': str, 'confidence': float }
        """
        if not text or not self.model or not self.vectorizer or not self.label_encoder:
            return {"intent": "fallback", "confidence": 0.0}

        cleaned = preprocessor.preprocess(text, lowercase=True, remove_punctuation=True, lemmatize=True)
        if not cleaned:
            return {"intent": "fallback", "confidence": 0.0}

        X_tfidf = self.vectorizer.transform([cleaned])

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_tfidf)[0]
            best_idx = int(np.argmax(probs))
            confidence = float(probs[best_idx])
            intent = str(self.label_encoder.inverse_transform([best_idx])[0])
        elif hasattr(self.model, "decision_function"):
            decision = self.model.decision_function(X_tfidf)[0]
            # Softmax on decision function for pseudo-confidence
            exp_d = np.exp(decision - np.max(decision))
            probs = exp_d / np.sum(exp_d)
            best_idx = int(np.argmax(probs))
            confidence = float(probs[best_idx])
            intent = str(self.label_encoder.inverse_transform([best_idx])[0])
        else:
            y_pred = self.model.predict(X_tfidf)[0]
            intent = str(self.label_encoder.inverse_transform([y_pred])[0])
            confidence = 0.85

        return {
            "intent": intent,
            "confidence": round(confidence, 4)
        }

    LOCALIZED_RESPONSES = {
        "greeting": {
            "en": [
                "Hello! How can I assist you today?",
                "Hi there! What can I help you with?",
                "Greetings! How may I help you?"
            ],
            "hi": [
                "नमस्ते! आज मैं आपकी क्या सहायता कर सकता हूँ?",
                "नमस्कार! मैं आपकी कैसे मदद कर सकता हूँ?"
            ],
            "hinglish": [
                "Namaste! Aaj main aapki kya help kar sakta hoon?",
                "Hello! Main aapki kaise help kar sakta hoon?"
            ]
        },
        "goodbye": {
            "en": [
                "Goodbye! Have a great day ahead!",
                "Bye! Feel free to reach out anytime."
            ],
            "hi": [
                "अलबिदा! आपका दिन शुभ हो!",
                "फिर मिलते हैं! अपना ध्यान रखें।"
            ],
            "hinglish": [
                "Goodbye! Aapka din accha rahe!",
                "Bye bye! Kabhi bhi help chahiye toh pucho."
            ]
        },
        "thanks": {
            "en": [
                "You're very welcome!",
                "Glad I could help!",
                "My pleasure!"
            ],
            "hi": [
                "आपका बहुत-बहुत धन्यवाद!",
                "मुझे सहायता करके खुशी हुई!"
            ],
            "hinglish": [
                "You're welcome! Mujhe help karke khushi hui!",
                "Koi baat nahi, happy to help!"
            ]
        },
        "capabilities": {
            "en": [
                "I can answer technical questions, classify intents, analyze sentiment, extract entities, and generate AI responses!"
            ],
            "hi": [
                "मैं तकनीकी प्रश्नों के उत्तर दे सकता हूँ, इरादों का वर्गीकरण कर सकता हूँ, भावना विश्लेषण कर सकता हूँ और एआई प्रतिक्रियाएं उत्पन्न कर सकता हूँ!"
            ],
            "hinglish": [
                "Main technical questions answer kar sakta hoon, intent classify kar sakta hoon, sentiment analyze kar sakta hoon aur AI responses generate kar sakta hoon!"
            ]
        },
        "time": {
            "en": [
                "The current server time can be checked on your system clock."
            ],
            "hi": [
                "वर्तमान समय आपके सिस्टम घड़ी पर देखा जा सकता है।"
            ],
            "hinglish": [
                "Current time aap apne system clock par check kar sakte hain."
            ]
        },
        "date": {
            "en": [
                "Today's date is available on your device's calendar."
            ],
            "hi": [
                "आज की तारीख आपके उपकरण के कैलेंडर पर उपलब्ध है।"
            ],
            "hinglish": [
                "Aaj ki date aapke device ke calendar par available hai."
            ]
        },
        "weather": {
            "en": [
                "I don't have real-time live weather satellite data right now."
            ],
            "hi": [
                "मेरे पास अभी वास्तविक समय के मौसम की जानकारी उपलब्ध नहीं है।"
            ],
            "hinglish": [
                "Mere paas abhi real-time live weather ka data nahi hai."
            ]
        },
        "account_help": {
            "en": [
                "For account assistance, please check your settings or contact support."
            ],
            "hi": [
                "खाता सहायता के लिए, कृपया अपनी सेटिंग्स जांचें या समर्थन से संपर्क करें।"
            ],
            "hinglish": [
                "Account help ke liye, please apni settings check karein ya support se contact karein."
            ]
        },
        "python": {
            "en": [
                "Python is a versatile, high-level programming language widely used in Web Development, Data Science, and AI."
            ],
            "hi": [
                "पायथन एक बहुमुखी, उच्च-स्तरीय प्रोग्रामिंग भाषा है जो वेब विकास, डेटा विज्ञान और एआई में व्यापक रूप से उपयोग की जाती है।"
            ],
            "hinglish": [
                "Python ek versatile, high-level programming language hai jo Web Development, Data Science aur AI mein widely use hoti hai."
            ]
        },
        "machine_learning": {
            "en": [
                "Machine Learning is a branch of AI focused on building applications that learn from data and improve accuracy over time."
            ],
            "hi": [
                "मशीन लर्निंग एआई की एक शाखा है जो ऐसे अनुप्रयोगों का निर्माण करने पर केंद्रित है जो डेटा से सीखते हैं।"
            ],
            "hinglish": [
                "Machine Learning AI ka ek branch hai jo applications build karne par focus karta hai jo data se learn karte hain."
            ]
        },
        "data_science": {
            "en": [
                "Data Science combines statistics, computer science, and domain knowledge to extract actionable insights from raw data."
            ],
            "hi": [
                "डेटा साइंस कच्चे डेटा से कार्रवाई योग्य अंतर्दृष्टि निकालने के लिए आंकड़ों, कंप्यूटर विज्ञान और ज्ञान को जोड़ता है।"
            ],
            "hinglish": [
                "Data Science statistics, computer science aur domain knowledge ko combine karke data se insights nikalta hai."
            ]
        },
        "technical_question": {
            "en": [
                "I am equipped to answer complex technical, software design, and programming questions!"
            ],
            "hi": [
                "मैं जटिल तकनीकी, सॉफ्टवेयर डिजाइन और प्रोग्रामिंग प्रश्नों का उत्तर देने में सक्षम हूँ!"
            ],
            "hinglish": [
                "Main complex technical, software design aur programming questions solve karne ke liye ready hoon!"
            ]
        }
    }

    def get_intent_response(self, intent: str, language: str = "en") -> str:
        """Retrieves a random predefined response for a known intent tag in requested language."""
        lang_key = (language or "en").lower()
        if lang_key not in ("en", "hi", "hinglish"):
            lang_key = "en"

        if intent in self.LOCALIZED_RESPONSES:
            responses = self.LOCALIZED_RESPONSES[intent].get(lang_key) or self.LOCALIZED_RESPONSES[intent].get("en", [])
            if responses:
                return random.choice(responses)

        responses = self.intent_responses.get(intent, [])
        if responses:
            return random.choice(responses)

        if lang_key == "hi":
            return "मैं आपके इरादे को समझता हूँ। मैं आपकी और सहायता कैसे कर सकता हूँ?"
        elif lang_key == "hinglish":
            return "Main aapke query ko samajhta hoon. Aapki aur kya assist kar sakta hoon?"
        return "I understand your intent. How can I assist you further?"

intent_service = IntentService()
