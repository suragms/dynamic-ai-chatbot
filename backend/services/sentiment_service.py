import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

def _ensure_vader_lexicon():
    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        try:
            nltk.download("vader_lexicon", quiet=True)
        except Exception:
            pass

_ensure_vader_lexicon()

class SentimentService:
    """
    Lightweight local sentiment analyzer returning sentiment label and score.
    Supports response tone adjustment without medical/psychological diagnosis claims.
    """

    def __init__(self):
        try:
            self.analyzer = SentimentIntensityAnalyzer()
        except Exception:
            self.analyzer = None

    def analyze(self, text: str) -> dict:
        """
        Analyze text sentiment.
        Returns: { 'sentiment': 'positive'|'neutral'|'negative', 'score': float }
        """
        if not text:
            return {"sentiment": "neutral", "score": 0.50}

        if self.analyzer:
            scores = self.analyzer.polarity_scores(text)
            compound = scores.get("compound", 0.0)

            if compound >= 0.05:
                label = "positive"
                score = (compound + 1) / 2  # Normalize [-1, 1] -> [0, 1]
            elif compound <= -0.05:
                label = "negative"
                score = abs(compound)
            else:
                label = "neutral"
                score = 0.50 + (abs(compound) / 2)

            return {
                "label": label,
                "sentiment": label,
                "score": round(float(score), 4)
            }

        # Fallback keyword matching
        lower_text = text.lower()
        pos_words = {"good", "great", "awesome", "excellent", "happy", "love", "thanks", "perfect", "wonderful"}
        neg_words = {"bad", "terrible", "awful", "horrible", "hate", "sad", "angry", "frustrated", "wrong", "issue"}

        pos_count = sum(1 for w in pos_words if w in lower_text)
        neg_count = sum(1 for w in neg_words if w in lower_text)

        if pos_count > neg_count:
            return {"label": "positive", "sentiment": "positive", "score": 0.80}
        elif neg_count > pos_count:
            return {"label": "negative", "sentiment": "negative", "score": 0.80}
        else:
            return {"label": "neutral", "sentiment": "neutral", "score": 0.50}

    def get_tone_prefix(self, sentiment: str) -> str:
        """Generate empathetic tone prefix based on sentiment for response style."""
        if sentiment == "negative":
            return "I understand this might be challenging or frustrating. Let me help resolve this for you."
        elif sentiment == "positive":
            return "That's fantastic to hear! I'm happy to assist you with this."
        return ""

sentiment_service = SentimentService()
