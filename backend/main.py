from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, DistilBertForSequenceClassification
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Emotion Classification API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Label mapping: model uses LABEL_0..LABEL_5, mapped to the 6 emotions
LABEL_MAP = {
    0: "joy",
    1: "sadness",
    2: "anger",
    3: "fear",
    4: "surprise",
    5: "disgust",
}

EMOTION_NAMES = ["joy", "sadness", "anger", "fear", "surprise", "disgust"]

# Global model and tokenizer
model = None
tokenizer = None


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    emotion: str
    confidence: float
    probabilities: dict[str, float]


def load_model():
    """Load the DistilBERT V8 model and tokenizer once at startup."""
    global model, tokenizer
    model_path = os.environ.get(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "model"),
    )
    logger.info(f"Loading tokenizer from: {model_path}")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    logger.info(f"Loading DistilBERT V8 model from: {model_path}")
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    model.eval()
    logger.info("Model and tokenizer loaded successfully.")


@app.on_event("startup")
async def startup_event():
    load_model()


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty.")

    try:
        inputs = tokenizer(
            request.text.strip(),
            return_tensors="pt",
            truncation=True,
            max_length=512,
        )

        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)[0]
            predicted_class = torch.argmax(probs).item()
            confidence = probs[predicted_class].item()

        emotion = LABEL_MAP.get(predicted_class, EMOTION_NAMES[0])
        probabilities = {
            name: round(probs[i].item(), 4)
            for i, name in enumerate(EMOTION_NAMES)
        }

        logger.info(
            f"Prediction: {emotion} ({confidence:.4f}) | Text: {request.text[:50]}..."
        )

        return PredictResponse(
            emotion=emotion,
            confidence=round(confidence, 4),
            probabilities=probabilities,
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}
