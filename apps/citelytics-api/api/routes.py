"""
API routes – aggregates all sub-routers.
"""

from fastapi import APIRouter

from api.analyze import router as analyze_router
from api.history import router as history_router
from api.health import router as health_router

router = APIRouter()
router.include_router(analyze_router, tags=["analysis"])
router.include_router(history_router, tags=["history"])
router.include_router(health_router, tags=["health"])
