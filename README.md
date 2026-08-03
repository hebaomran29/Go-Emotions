# Emotion Classification on GoEmotions

**A comparative study of LSTM, BiLSTM+Attention, GRU, and DistilBERT for 6-class emotion classification from text, with an interactive web interface.**

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
  - [Quick Start (Docker)](#quick-start-docker)
  - [Local Development](#local-development)
- [API Reference](#api-reference)
- [Model Details](#model-details)
  - [Dataset](#dataset)
  - [Preprocessing & Ekman Mapping](#preprocessing--ekman-mapping)
  - [Trained Models](#trained-models)
- [Results](#results)
- [Error Analysis](#error-analysis)
- [Limitations & Future Work](#limitations--future-work)
- [License](#license)

---

## Overview

This project builds and compares several text classification models to predict emotion from short text comments, using the [GoEmotions](https://huggingface.co/datasets/google-research-datasets/go_emotions) dataset. The 27 fine-grained GoEmotions labels are mapped to 6 broader emotion categories based on **Ekman's basic emotion model**:

| Emotion | Description |
|---------|-------------|
| Joy | Happiness, love, gratitude, excitement |
| Sadness | Disappointment, grief, remorse |
| Anger | Frustration, annoyance, disapproval |
| Fear | Anxiety, nervousness, dread |
| Surprise | Shock, curiosity, realization |
| Disgust | Revulsion, contempt |

Five model variants across four architectures were trained and evaluated on the **exact same data split**:

1. **LSTM (frozen GloVe)** — Single LSTM(128) with non-trainable 100d GloVe embeddings
2. **LSTM (fine-tuned GloVe)** — Same architecture, embeddings trainable
3. **BiLSTM + Attention** — Bidirectional LSTM(64) with Bahdanau-style attention
4. **GRU** — Single GRU(128) with fine-tuned GloVe embeddings
5. **DistilBERT V8 (fine-tuned)** — `distilbert-base-uncased` fine-tuned end-to-end

The best-performing model (**DistilBERT V8**) is deployed behind a FastAPI backend and connected to an interactive "Emotion Headquarters" frontend where animated emotion characters react to predictions in real time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Port 5173)                    │
│                                                             │
│   ┌───────────────────────────────────────────────────┐     │
│   │           React + Vite + Framer Motion             │     │
│   │          Emotion Headquarters UI                    │     │
│   │                                                   │     │
│   │  User types text → clicks "Feel" button          │     │
│   └────────────────────┬──────────────────────────────┘     │
│                        │ POST /predict                      │
│              ┌─────────▼──────────┐                         │
│              │   Nginx (Docker)   │  ← proxies /predict     │
│              └─────────┬──────────┘                         │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                 │
│                                                             │
│   ┌───────────────────────────────────────────────────┐     │
│   │              AutoTokenizer                         │     │
│   │         (DistilBertTokenizerFast)                   │     │
│   └────────────────────┬──────────────────────────────┘     │
│                        │                                    │
│   ┌────────────────────▼──────────────────────────────┐     │
│   │           DistilBERT V8 Model                      │     │
│   │   DistilBertForSequenceClassification              │     │
│   │   6 classes · 66M params · safetensors              │     │
│   └────────────────────┬──────────────────────────────┘     │
│                        │                                    │
│   ┌────────────────────▼──────────────────────────────┐     │
│   │         Softmax → {emotion, confidence,            │     │
│   │                  probabilities}                     │     │
│   └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
emotion-classification/
├── backend/
│   ├── main.py                 # FastAPI app with /predict endpoint
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Python 3.11-slim image
│   └── model/
│       ├── config.json         # DistilBERT model configuration
│       ├── tokenizer.json      # Fast tokenizer vocabulary
│       ├── tokenizer_config.json
│       └── model.safetensors    # ⚠️ Too large for Git — add manually
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main app with character placement & state
│   │   ├── main.tsx            # React entry point
│   │   ├── index.css           # Tailwind imports
│   │   ├── components/
│   │   │   ├── Character.tsx   # Animated emotion characters
│   │   │   ├── Console.tsx     # Input console + results display
│   │   │   ├── Environment.tsx # Background, particles, floor
│   │   │   └── MemoryOrb.tsx   # Floating emotion orb
│   │   ├── data/
│   │   │   └── emotions.ts    # Emotion configs + API call
│   │   └── types/
│   │       └── emotion.ts      # TypeScript type definitions
│   ├── public/characters/      # 6 character PNG assets
│   ├── Dockerfile             # Multi-stage: Node build → Nginx
│   ├── nginx.conf             # Reverse proxy config
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml          # Orchestrate backend + frontend
├── .env.example                # Environment variable template
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 + Framer Motion |
| Icons | Lucide React |
| Backend framework | FastAPI + Uvicorn |
| ML model | DistilBERT (`distilbert-base-uncased`) |
| Tokenizer | `AutoTokenizer` (DistilBertTokenizerFast) |
| Model format | SafeTensors |
| Containerization | Docker + Docker Compose |
| Production web server | Nginx (Alpine) |

---

## Setup

### Prerequisites

- **Docker & Docker Compose** (for containerized setup)
- **OR** Python 3.11+ and Node.js 20+ (for local dev)
- The `model.safetensors` file (not included in the repo due to size)

### Placing the Model File

Copy your trained `model.safetensors` into `backend/model/`:

```bash
cp /path/to/distilbert_finetuned_model_v2/model.safetensors backend/model/
```

> The `config.json`, `tokenizer.json`, and `tokenizer_config.json` are already included.

---

### Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/emotion-classification.git
cd emotion-classification

# 2. Place model.safetensors in backend/model/
cp /path/to/model.safetensors backend/model/

# 3. Build and run
docker compose up --build

# 4. Open in browser
# http://localhost:5173
```

That's it. Docker Compose will:
- Build the backend image, install Python dependencies, and load the DistilBERT V8 model
- Build the frontend image (Node build → static files served by Nginx)
- Start Nginx on port 5173 which proxies `/predict` requests to the backend container

To stop:
```bash
docker compose down
```

---

### Local Development

#### Backend

```bash
cd backend
pip install -r requirements.txt

# Option A — auto-loads from backend/model/
uvicorn main:app --host 0.0.0.0 --port 8000

# Option B — custom model path
MODEL_PATH=/path/to/your/model uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> The frontend calls `http://localhost:8000/predict` by default (controlled by `VITE_API_URL` env var).

---

## API Reference

### `POST /predict`

Classify the emotion of a text sentence using the fine-tuned DistilBERT V8 model.

**Request:**

```json
{
  "text": "I finally passed my exam!"
}
```

**Response:**

```json
{
  "emotion": "joy",
  "confidence": 0.94,
  "probabilities": {
    "joy": 0.94,
    "sadness": 0.01,
    "anger": 0.01,
    "fear": 0.01,
    "surprise": 0.02,
    "disgust": 0.01
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `emotion` | `string` | Predicted emotion (one of 6 classes) |
| `confidence` | `float` | Softmax probability of the predicted class |
| `probabilities` | `object` | Probability for **all 6** emotion classes |

### `GET /health`

Health check endpoint.

```json
{ "status": "ok", "model_loaded": true }
```

---

## Model Details

### Dataset

| Property | Value |
|----------|-------|
| Source | [GoEmotions](https://huggingface.co/datasets/google-research-datasets/go_emotions) (Google Research) |
| Original size | 43,410 training rows, 27 emotion labels + neutral (28 classes) |
| Multi-label | Yes — 16.4% of rows carry more than one label |
| Avg. sentence length | 12.8 words (95th percentile: 24 words) |

### Preprocessing & Ekman Mapping

1. **Cleaning:** Removed 183 duplicate rows, URLs, Reddit mentions, HTML entities. Casing, punctuation, and emojis preserved.

2. **27 → 6 class mapping (Ekman):**

   | Ekman Class | GoEmotions Labels |
   |-------------|-----------------|
   | Joy | admiration, amusement, approval, caring, desire, excitement, gratitude, joy, love, optimism, pride, relief |
   | Sadness | disappointment, embarrassment, grief, remorse, sadness |
   | Anger | anger, annoyance, disapproval |
   | Fear | fear, nervousness |
   | Surprise | confusion, curiosity, realization, surprise |
   | Disgust | disgust |

   Neutral-only rows and tied votes were dropped (34.8% removed). Final dataset: **28,201 rows**.

3. **Final class distribution:**

   | Emotion | Rows | % |
   |---------|------|---|
   | Joy | 15,818 | 56.1% |
   | Anger | 4,632 | 16.4% |
   | Surprise | 4,175 | 14.8% |
   | Sadness | 2,484 | 8.8% |
   | Fear | 570 | 2.0% |
   | Disgust | 522 | 1.9% |

4. **Split:** Stratified 80/10/10 (train/val/test), fixed seed 42.

### Trained Models

| Model | Architecture | Trainable Params | Key Detail |
|-------|-------------|-----------------|-------------|
| LSTM (frozen GloVe) | Embedding(100d) → LSTM(128) → Dense | 125K / 2M total | GloVe frozen |
| LSTM (fine-tuned GloVe) | Same | 2M / 2M total | GloVe trainable |
| BiLSTM + Attention | Embedding → BiLSTM(64) → Attention → Dense | ~2M | Bahdanau attention |
| GRU | Embedding(100d) → GRU(128) → Dense | ~2M | Fine-tuned GloVe |
| **DistilBERT V8** | `distilbert-base-uncased` → Linear(768, 6) | 66M | Fine-tuned 3 epochs |

**Training configuration:**
- RNN models: Adam, batch 64, early stopping (patience=3), dropout 0.5, class weights (sqrt-dampened)
- DistilBERT: Trainer API, 4 epochs, batch 16/64, lr 2e-5, weight decay 0.01, best macro F1 checkpoint

---

## Results

### Overall Performance (Test Set — 2,821 rows)

| Model | Accuracy | Macro F1 | Weighted F1 |
|-------|----------|----------|-------------|
| **DistilBERT V8** | **0.790** | **0.667** | **0.792** |
| GRU | 0.728 | 0.597 | 0.730 |
| BiLSTM + Attention | 0.726 | 0.591 | 0.728 |
| LSTM (fine-tuned GloVe) | 0.667 | 0.551 | 0.686 |
| LSTM (frozen GloVe) | 0.664 | 0.538 | 0.680 |

### Per-Class Performance — DistilBERT V8

| Emotion | Precision | Recall | F1 | Support |
|---------|-----------|--------|----|---------|
| Joy | 0.906 | 0.874 | 0.890 | 1,582 |
| Sadness | 0.654 | 0.625 | 0.639 | 248 |
| Anger | 0.642 | 0.688 | 0.664 | 464 |
| Fear | 0.650 | 0.684 | 0.667 | 57 |
| Surprise | 0.696 | 0.739 | 0.717 | 418 |
| Disgust | 0.411 | 0.442 | 0.426 | 52 |

### Inference Examples

| Input | Predicted Emotion |
|-------|-----------------|
| I can't believe you did this, I'm so furious right now | Anger |
| This is disgusting, I've never seen anything like it | Disgust |
| I'm terrified of what might happen next | Fear |
| Wow, I really didn't expect that at all! | Surprise |
| Thank you so much, this made my whole day | Joy |
| I miss him so much, nothing feels the same anymore | Sadness |

---

## Error Analysis

DistilBERT misclassified 593 out of 2,821 test examples (21.0%).

**Top confusion pairs:**

| True | Predicted | Count |
|------|-----------|-------|
| Joy | Anger | 84 |
| Joy | Surprise | 80 |
| Anger | Joy | 54 |
| Surprise | Joy | 49 |
| Sadness | Anger | 45 |

The main error patterns:

- **Joy ↔ Anger ↔ Surprise confusion:** These three classes are the largest and share contextual overlap (strong emotional language can be ambiguous without more context).
- **Sarcasm and figurative language:** Expressions like "looking dangerous" or "makes me cringe" don't use explicit emotion words, making them hard for any model trained on literal expressions.
- **Genuine ambiguity:** Several "fear" examples read more like mild concern, and several "disgust" examples overlap with moral outrage (anger).
- **Low support for minority classes:** Fear (57) and disgust (52) test examples mean a handful of hard cases significantly impacts their metrics.

---

## Limitations & Future Work

- **Class imbalance:** Joy dominates at 56.1%; fear and disgust are under 2% each. More aggressive resampling (oversampling, back-translation augmentation) could help.
- **Ekman mapping loss:** Collapsing 27 nuanced labels into 6 broad categories by majority vote loses information; tied votes are dropped entirely.
- **Single domain:** GoEmotions is English Reddit comments. Performance may not transfer to Arabic text, customer support, or formal writing without retraining.
- **Sequence length cap:** 25 tokens (based on 95th percentile) trims longer comments.
- **Future directions:** Larger transformers (RoBERTa, BERT-base), confusion-aware loss penalizing joy/anger/surprise mixups, out-of-domain validation set.

---

## License

This project is for educational and research purposes. The GoEmotions dataset is released by Google Research under the Apache 2.0 license. DistilBERT is released by Hugging Face under the Apache 2.0 license.
