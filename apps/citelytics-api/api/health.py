"""
/api/health  – liveness probe.
"""

from fastapi import APIRouter
from models.loader import model_is_ready

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "model_ready": model_is_ready(),
        "disclaimer": "Demo model / Research prototype",
    }
