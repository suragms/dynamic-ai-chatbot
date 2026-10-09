# Dynamic AI Chatbot - Machine Learning Intent Model Evaluation

## 1. Overview & Dataset

The intent recognition engine classifies natural language user inputs into one of 18 distinct intent categories. The model operates locally, enabling low-latency deterministic handling, confidence gating, and graceful fallback when external generative models are unconfigured or unavailable.

### Dataset Specifications
- **Source File**: `backend/training/data/intents.json`
- **Total Intent Classes**: 18
- **Total Labeled Samples**: 203
- **Mean Samples per Class**: ~11.3
- **Feature Extraction**: TF-IDF Vectorizer (`TfidfVectorizer`)
  - Tokenization: NLTK Lemmatized Tokens
  - N-gram Range: Unigrams and Bigrams (`(1, 2)`)
  - Sublinear Term Frequency: `True` (`sublinear_tf=True`)
  - Max Features: 1000

---

## 2. Model Comparison & Benchmarking

Three classification algorithms were trained and evaluated during cross-validation benchmarking:

| Classifier Algorithm | Hyperparameters | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | Status |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Linear SVM (`SGDClassifier`)** | `loss='log_loss', penalty='l2', alpha=1e-4, max_iter=1000` | **100.00%** | **1.0000** | **1.0000** | **1.0000** | **Selected Production Model** |
| **Logistic Regression** | `multi_class='auto', solver='lbfgs', max_iter=500` | 97.54% | 0.9780 | 0.9754 | 0.9748 | Evaluated |
| **Multinomial Naive Bayes** | `alpha=0.1` | 94.09% | 0.9482 | 0.9409 | 0.9392 | Evaluated |

**Decision Justification**:
Linear SVM (`SGDClassifier`) with modified Huber / Log Loss provides optimal margin separation in sparse, high-dimensional TF-IDF feature space, achieving 100% precision and recall across all intent classes while yielding calibrated probability estimates for confidence thresholding (`INTENT_CONFIDENCE_THRESHOLD = 0.60`).

---

## 3. Production Model Performance Metrics

Metrics derived from the saved evaluation artifact (`models/intent_model_metrics.json`):

- **Model Name**: Linear SVM (`SGDClassifier`)
- **Overall Accuracy**: **100.00%**
- **Weighted Precision**: **1.0000**
- **Weighted Recall**: **1.0000**
- **Weighted F1-Score**: **1.0000**
- **Total Support**: 203 samples

### Per-Class Evaluation Breakdown

| Intent Tag | Category Type | Precision | Recall | F1-Score | Support (Samples) |
|---|---|:---:|:---:|:---:|:---:|
| `account_help` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 8 |
| `capabilities` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 12 |
| `complaint` | Empathetic Tone | 1.0000 | 1.0000 | 1.0000 | 9 |
| `data_science` | FAQ Domain | 1.0000 | 1.0000 | 1.0000 | 9 |
| `date` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 8 |
| `fallback` | Fallback Handler | 1.0000 | 1.0000 | 1.0000 | 10 |
| `general_question` | Generative Trigger | 1.0000 | 1.0000 | 1.0000 | 11 |
| `goodbye` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 19 |
| `greeting` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 23 |
| `help` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 14 |
| `machine_learning` | FAQ Domain | 1.0000 | 1.0000 | 1.0000 | 10 |
| `negative_feedback`| Empathetic Tone | 1.0000 | 1.0000 | 1.0000 | 8 |
| `positive_feedback`| Empathetic Tone | 1.0000 | 1.0000 | 1.0000 | 9 |
| `python` | FAQ Domain | 1.0000 | 1.0000 | 1.0000 | 10 |
| `technical_question`| FAQ Domain | 1.0000 | 1.0000 | 1.0000 | 10 |
| `thanks` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 14 |
| `time` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 8 |
| `weather` | Deterministic | 1.0000 | 1.0000 | 1.0000 | 11 |
| **Macro Average** | — | **1.0000** | **1.0000** | **1.0000** | **203** |
| **Weighted Average**| — | **1.0000** | **1.0000** | **1.0000** | **203** |

---

## 4. Confusion Matrix

The confusion matrix demonstrates zero off-diagonal misclassifications:

```
                  Predicted Class (18 Intent Categories)
                acc cap com ds  dat fb  gq  gb  gr  hlp ml  neg pos py  tq  thk tim wth
acc [account_help]  8   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0
cap [capabilities]  0  12   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0
com [complaint]     0   0   9   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0
ds  [data_science]  0   0   0   9   0   0   0   0   0   0   0   0   0   0   0   0   0   0
dat [date]          0   0   0   0   8   0   0   0   0   0   0   0   0   0   0   0   0   0
fb  [fallback]      0   0   0   0   0  10   0   0   0   0   0   0   0   0   0   0   0   0
gq  [general_quest] 0   0   0   0   0   0  11   0   0   0   0   0   0   0   0   0   0   0
gb  [goodbye]       0   0   0   0   0   0   0  19   0   0   0   0   0   0   0   0   0   0
gr  [greeting]      0   0   0   0   0   0   0   0  23   0   0   0   0   0   0   0   0   0
hlp [help]          0   0   0   0   0   0   0   0   0  14   0   0   0   0   0   0   0   0
ml  [machine_learn] 0   0   0   0   0   0   0   0   0   0  10   0   0   0   0   0   0   0
neg [negative_fb]   0   0   0   0   0   0   0   0   0   0   0   8   0   0   0   0   0   0
pos [positive_fb]   0   0   0   0   0   0   0   0   0   0   0   0   9   0   0   0   0   0
py  [python]        0   0   0   0   0   0   0   0   0   0   0   0   0  10   0   0   0   0
tq  [technical_q]   0   0   0   0   0   0   0   0   0   0   0   0   0   0  10   0   0   0
thk [thanks]        0   0   0   0   0   0   0   0   0   0   0   0   0   0   0  14   0   0
tim [time]          0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   8   0
wth [weather]       0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0   0  11
```

---

## 5. Deployment & Runtime Verification

The trained pipeline bundle is serialized into `models/intent_model.pkl` containing:
1. `model`: Scikit-Learn `SGDClassifier` instance.
2. `vectorizer`: Trained `TfidfVectorizer` vocabulary and IDF weights.
3. `label_encoder`: Scikit-Learn `LabelEncoder` preserving class string mapping.

Inference latency averages **< 5ms** per input string, providing high throughput for real-time conversational routing.
