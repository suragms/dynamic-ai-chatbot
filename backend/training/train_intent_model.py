import json
import joblib
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

from backend.nlp.preprocessor import preprocessor
from backend.config import config

def load_dataset(json_path: Path):
    """Load intent patterns and tags from intents.json."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = []
    labels = []
    intent_responses = {}

    for intent in data.get("intents", []):
        tag = intent["tag"]
        intent_responses[tag] = intent.get("responses", [])
        for pattern in intent.get("patterns", []):
            processed = preprocessor.preprocess(pattern, lowercase=True, remove_punctuation=True, lemmatize=True)
            if processed:
                texts.append(processed)
                labels.append(tag)

    return texts, labels, intent_responses

def train_and_evaluate_models():
    """Train and compare multiple classical ML classifiers for intent detection."""
    dataset_path = Path(__file__).parent / "data" / "intents.json"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Intents dataset not found at {dataset_path}")

    print("Loading intent dataset...")
    texts, labels, intent_responses = load_dataset(dataset_path)
    print(f"Total training samples: {len(texts)} across {len(set(labels))} unique intent classes.")

    # Encode Labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(labels)

    # Vectorize text using TF-IDF
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
    X_tfidf = vectorizer.fit_transform(texts)

    # Candidate models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=2.0),
        "Linear SVM": SGDClassifier(loss="log_loss", max_iter=1000, random_state=42, alpha=1e-3),
        "Naive Bayes": MultinomialNB(alpha=0.5)
    }

    results = {}
    best_model_name = None
    best_score = -1.0
    best_model_obj = None

    print("\nEvaluating models with Stratified K-Fold Cross-Validation...")
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    for name, model in models.items():
        cv_results = cross_validate(
            model, X_tfidf, y_encoded, cv=skf,
            scoring=["accuracy", "f1_weighted", "precision_weighted", "recall_weighted"]
        )

        acc = float(np.mean(cv_results["test_accuracy"]))
        f1 = float(np.mean(cv_results["test_f1_weighted"]))
        prec = float(np.mean(cv_results["test_precision_weighted"]))
        rec = float(np.mean(cv_results["test_recall_weighted"]))

        results[name] = {
            "accuracy": round(acc, 4),
            "f1_weighted": round(f1, 4),
            "precision_weighted": round(prec, 4),
            "recall_weighted": round(rec, 4)
        }

        print(f"  [{name}] Accuracy: {acc:.4f} | F1: {f1:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f}")

        if f1 > best_score:
            best_score = f1
            best_model_name = name
            best_model_obj = model

    print(f"\nBest Selected Model: '{best_model_name}' (F1 Score: {best_score:.4f})")

    # Fit best model on entire dataset
    best_model_obj.fit(X_tfidf, y_encoded)

    # Full train-set metrics for export
    y_pred = best_model_obj.predict(X_tfidf)
    acc = float(accuracy_score(y_encoded, y_pred))
    p, r, f1, _ = precision_recall_fscore_support(y_encoded, y_pred, average="weighted")

    # Save model artifact payload
    artifact_payload = {
        "model": best_model_obj,
        "vectorizer": vectorizer,
        "label_encoder": label_encoder,
        "intent_responses": intent_responses,
        "model_name": best_model_name
    }

    config.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact_payload, config.MODEL_PATH)
    print(f"Saved best intent classifier artifact to {config.MODEL_PATH}")

    # Generate metrics JSON file
    metrics_data = {
        "selected_model": best_model_name,
        "cross_validation_comparison": results,
        "final_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(float(p), 4),
            "recall": round(float(r), 4),
            "f1_score": round(float(f1), 4)
        },
        "classes": list(label_encoder.classes_),
        "num_samples": len(texts)
    }

    with open(config.METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"Saved model metrics report to {config.METRICS_PATH}")
    return metrics_data

if __name__ == "__main__":
    train_and_evaluate_models()
