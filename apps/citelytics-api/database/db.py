"""
SQLite database – stores analysis history.
"""

import json
import logging
import sqlite3
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent.parent / "data" / "citelytics.db"


def init_db():
    """Create tables if they don't exist."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                url         TEXT NOT NULL,
                created_at  TEXT NOT NULL DEFAULT (datetime('now')),
                citation_probability REAL,
                citation_score       INTEGER,
                prediction  TEXT,
                features    TEXT,
                shap_values TEXT,
                recommendations TEXT
            )
        """)
        conn.commit()
    logger.info("Database ready at %s", DB_PATH)


def _conn():
    return sqlite3.connect(DB_PATH)


def save_analysis(
    *,
    url: str,
    citation_probability: float,
    prediction: str,
    features: dict[str, Any],
    shap_values: dict[str, Any],
    recommendations: list[dict[str, Any]],
) -> int:
    citation_score = round(citation_probability * 100)
    with _conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO analyses
                (url, citation_probability, citation_score, prediction, features, shap_values, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                url,
                citation_probability,
                citation_score,
                prediction,
                json.dumps(features),
                json.dumps(shap_values),
                json.dumps(recommendations),
            ),
        )
        conn.commit()
        return cur.lastrowid


def get_all_analyses() -> list[dict[str, Any]]:
    with _conn() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, url, created_at, citation_probability, citation_score, prediction "
            "FROM analyses ORDER BY id DESC LIMIT 100"
        ).fetchall()
    return [dict(r) for r in rows]


def get_analysis_by_id(analysis_id: int) -> dict[str, Any] | None:
    with _conn() as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM analyses WHERE id = ?", (analysis_id,)
        ).fetchone()
    if not row:
        return None
    d = dict(row)
    for key in ("features", "shap_values", "recommendations"):
        if d.get(key):
            try:
                d[key] = json.loads(d[key])
            except json.JSONDecodeError:
                pass
    return d
