"""
Predictor service – runs features through the XGBoost model.
"""

import logging
from typing import Any

import numpy as np
import pandas as pd

from models.loader import get_model, get_feature_columns

logger = logging.getLogger(__name__)


def _flatten_features(features: dict[str, Any]) -> dict[str, float]:
    """Flatten nested feature dict into a single-level dict of numeric values."""
    flat: dict[str, float] = {}
    for section_val in features.values():
        if isinstance(section_val, dict):
            for k, v in section_val.items():
                if isinstance(v, (int, float)):
                    flat[k] = float(v)
    return flat


def predict_citation_likelihood(features: dict[str, Any]) -> dict[str, Any]:
    """
    Pass extracted features through the XGBoost model.

    Returns:
        citation_probability  – float 0–1
        citation_score        – int 0–100
        prediction            – human-readable label
        prediction_tier       – one of low / moderate / high / very_high
    """
    model = get_model()
    feature_cols = get_feature_columns()

    if model is None:
        logger.error("Model not ready – returning fallback 0.5 probability")
        return {
            "citation_probability": 0.5,
            "citation_score": 50,
            "prediction": "Unknown (model not ready)",
            "prediction_tier": "moderate",
        }

    flat = _flatten_features(features)

    # Build a single-row DataFrame aligned to training columns
    row = {col: flat.get(col, 0.0) for col in feature_cols}
    df = pd.DataFrame([row])

    prob = float(model.predict_proba(df)[0][1])
    score = round(prob * 100)

    if score <= 30:
        prediction = "Less likely to be cited"
        tier = "low"
    elif score <= 60:
        prediction = "Moderately likely to be cited"
        tier = "moderate"
    elif score <= 80:
        prediction = "Likely to be cited"
        tier = "high"
    else:
        prediction = "Very likely to be cited"
        tier = "very_high"

    return {
        "citation_probability": round(prob, 4),
        "citation_score": score,
        "prediction": prediction,
        "prediction_tier": tier,
    }
