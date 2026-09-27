"""History API router."""

from fastapi import APIRouter, HTTPException
from database.db import get_all_history, get_history_by_id

router = APIRouter()


@router.get("/history")
async def list_history():
    rows = await get_all_history()
    return {"history": rows}


@router.get("/history/{record_id}")
async def get_history(record_id: int):
    row = await get_history_by_id(record_id)
    if row is None:
        raise HTTPException(404, "Record not found.")
    return row
