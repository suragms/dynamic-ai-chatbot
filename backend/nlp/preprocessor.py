import re
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# Ensure necessary NLTK data packages are available
def _ensure_nltk_resources():
    resources = [
        ("tokenizers/punkt", "punkt"),
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/stopwords", "stopwords"),
        ("corpora/wordnet", "wordnet")
    ]
    for res_path, res_name in resources:
        try:
            nltk.data.find(res_path)
        except LookupError:
            try:
                nltk.download(res_name, quiet=True)
            except Exception:
                pass

_ensure_nltk_resources()

class NLPPreprocessor:
    """
    Reusable text preprocessing pipeline for NLP and Machine Learning.
    Performs tokenization, normalization, lemmatization, and text cleaning
    while preserving original input for Generative AI.
    """

    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        try:
            self.stop_words = set(stopwords.words("english"))
        except Exception:
            self.stop_words = {
                "a", "an", "the", "and", "or", "but", "if", "because", "as",
                "until", "while", "of", "at", "by", "for", "with", "about",
                "against", "between", "into", "through", "during", "before",
                "after", "above", "below", "to", "from", "up", "down", "in",
                "out", "on", "off", "over", "under", "again", "further", "then",
                "once", "here", "there", "when", "where", "why", "how", "all",
                "any", "both", "each", "few", "more", "most", "other", "some",
                "such", "no", "nor", "not", "only", "own", "same", "so", "than",
                "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
            }

    def clean_text(self, text: str) -> str:
        """Standardize raw text: strip whitespace and normalize internal spaces."""
        if not text:
            return ""
        text = re.sub(r"\s+", " ", text.strip())
        return text

    def normalize(self, text: str, lowercase: bool = True, remove_punctuation: bool = True) -> str:
        """Normalize text by lowercasing and removing punctuation."""
        text = self.clean_text(text)
        if lowercase:
            text = text.lower()
        if remove_punctuation:
            text = text.translate(str.maketrans("", "", string.punctuation))
        return text

    def tokenize(self, text: str) -> list[str]:
        """Split text into word tokens using NLTK or fallback regex."""
        if not text:
            return []
        try:
            return word_tokenize(text)
        except Exception:
            return re.findall(r"\b\w+\b", text)

    def preprocess(
        self,
        text: str,
        lowercase: bool = True,
        remove_punctuation: bool = True,
        remove_stopwords: bool = False,
        lemmatize: bool = True
    ) -> str:
        """
        Complete preprocessing pipeline returning processed text string.
        """
        normalized_text = self.normalize(text, lowercase=lowercase, remove_punctuation=remove_punctuation)
        tokens = self.tokenize(normalized_text)

        processed_tokens = []
        for token in tokens:
            if remove_stopwords and token in self.stop_words:
                continue
            if lemmatize:
                try:
                    token = self.lemmatizer.lemmatize(token)
                except Exception:
                    pass
            processed_tokens.append(token)

        return " ".join(processed_tokens)

preprocessor = NLPPreprocessor()
