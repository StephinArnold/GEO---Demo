"""
/api/history  – Analysis history CRUD.
"""

import json
import logging
from fastapi import APIRouter, HTTPException

from database.db import get_all_analyses, get_analysis_by_id

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/history")
async def list_history():
    """Return all saved analyses (most recent first)."""
    rows = get_all_analyses()
    return {"analyses": rows}


@router.get("/history/{analysis_id}")
async def get_history(analysis_id: int):
    """Return a single saved analysis by ID."""
    row = get_analysis_by_id(analysis_id)
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return row
