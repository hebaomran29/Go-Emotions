# ── Backend: DistilBERT V8 FastAPI ──────────────────────────────────
FROM python:3.11-slim AS base

WORKDIR /app

# System deps needed by torch/transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY model/ ./model/

# MODEL_PATH defaults to /app/model inside the container.
# To override at runtime: docker run -e MODEL_PATH=/data/model ...
ENV MODEL_PATH=/app/model

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
