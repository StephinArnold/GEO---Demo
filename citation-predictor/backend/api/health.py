"""Health-check endpoint."""

from fastapi import APIRouter
from models.model_loader import get_model

router = APIRouter()


@router.get("/health")
def health():
    try:
        model, _ = get_model()
        model_ok = model is not None
    except Exception:
        model_ok = False

    return {
        "status":    "ok" if model_ok else "degraded",
        "model":     "loaded" if model_ok else "unavailable",
        "service":   "Citelytics API",
        "version":   "1.0.0",
    }
