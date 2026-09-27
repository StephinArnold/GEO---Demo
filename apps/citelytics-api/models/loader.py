"""
Model loader – loads the XGBoost citation model from disk.

If no trained model exists, a demo model is generated from synthetic data
so the full pipeline can be demonstrated without real citation labels.

⚠️  IMPORTANT:
    The demo model is trained on SYNTHETIC data for development/testing only.
    Replace `models/citation_model.pkl` with a model trained on real
    citation labels before academic submission.
"""

import json
import logging
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_PATH = MODEL_DIR / "citation_model.pkl"
COLUMNS_PATH = MODEL_DIR / "feature_columns.json"

_model = None
_feature_columns: list[str] = []


# ─────────────────────────── public API ─────────────────────────────────────

def model_is_ready() -> bool:
    return _model is not None


def get_model():
    return _model


def get_feature_columns() -> list[str]:
    return _feature_columns


def ensure_model_ready():
    """Load from disk, or create & save a demo model."""
    global _model, _feature_columns

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if MODEL_PATH.exists() and COLUMNS_PATH.exists():
        logger.info("Loading model from %s", MODEL_PATH)
        _model = joblib.load(MODEL_PATH)
        with open(COLUMNS_PATH) as f:
            _feature_columns = json.load(f)
        logger.info("Model loaded. Features: %d", len(_feature_columns))
    else:
        logger.warning(
            "No trained model found – generating DEMO model from synthetic data. "
            "⚠️  Replace models/citation_model.pkl with a real model before submission."
        )
        _model, _feature_columns = _create_and_save_demo_model()


# ─────────────────────────── demo model ─────────────────────────────────────

FEATURE_COLUMNS = [
    "word_count",
    "sentence_count",
    "avg_sentence_length",
    "paragraph_count",
    "avg_paragraph_length",
    "factual_density",
    "numeric_statements",
    "quotation_count",
    "citation_count",
    "external_link_count",
    "internal_link_count",
    "image_count",
    "list_count",
    "table_count",
    "emphasis_count",
    "emphasis_density",
    "h1_count",
    "h2_count",
    "h3_count",
    "heading_count",
    "heading_depth",
    "hierarchy_consistent",
    "section_count",
    "avg_paras_per_section",
    "format_diversity",
    "macro_structure_score",
    "meso_structure_score",
    "micro_structure_score",
    "schema_present",
    "local_business_schema",
    "faq_schema",
    "organization_schema",
    "article_schema",
    "schema_type_count",
    "has_phone",
    "has_address",
    "has_hours",
    "has_rating",
    "has_reviews",
    "has_services",
    "has_email",
    "has_faq",
    "has_geo_info",
    "local_business_readiness_score",
]


def _create_and_save_demo_model():
    """
    Generate a synthetic dataset and train a demo XGBoost model.

    The synthetic data is designed so that pages with good structure,
    schema markup, high factual density, and local business signals tend
    to be labelled as 'cited'.  This is NOT based on real-world data.
    """
    rng = np.random.default_rng(42)
    N = 500

    # High-quality pages (cited)
    n_pos = 250
    pos = {
        "word_count": rng.integers(600, 3000, n_pos),
        "sentence_count": rng.integers(30, 150, n_pos),
        "avg_sentence_length": rng.uniform(12, 22, n_pos),
        "paragraph_count": rng.integers(8, 40, n_pos),
        "avg_paragraph_length": rng.uniform(40, 90, n_pos),
        "factual_density": rng.uniform(0.5, 5.0, n_pos),
        "numeric_statements": rng.integers(5, 40, n_pos),
        "quotation_count": rng.integers(0, 8, n_pos),
        "citation_count": rng.integers(2, 15, n_pos),
        "external_link_count": rng.integers(3, 20, n_pos),
        "internal_link_count": rng.integers(5, 30, n_pos),
        "image_count": rng.integers(2, 15, n_pos),
        "list_count": rng.integers(2, 8, n_pos),
        "table_count": rng.integers(0, 4, n_pos),
        "emphasis_count": rng.integers(5, 30, n_pos),
        "emphasis_density": rng.uniform(0.2, 2.0, n_pos),
        "h1_count": rng.integers(1, 2, n_pos),
        "h2_count": rng.integers(3, 10, n_pos),
        "h3_count": rng.integers(2, 12, n_pos),
        "heading_count": rng.integers(6, 20, n_pos),
        "heading_depth": rng.integers(3, 5, n_pos),
        "hierarchy_consistent": rng.choice([1], n_pos),
        "section_count": rng.integers(4, 12, n_pos),
        "avg_paras_per_section": rng.uniform(3, 6, n_pos),
        "format_diversity": rng.integers(3, 7, n_pos),
        "macro_structure_score": rng.uniform(0.6, 1.0, n_pos),
        "meso_structure_score": rng.uniform(0.5, 1.0, n_pos),
        "micro_structure_score": rng.uniform(0.4, 0.9, n_pos),
        "schema_present": rng.choice([1], n_pos),
        "local_business_schema": rng.choice([0, 1], n_pos),
        "faq_schema": rng.choice([0, 1], n_pos, p=[0.4, 0.6]),
        "organization_schema": rng.choice([0, 1], n_pos, p=[0.3, 0.7]),
        "article_schema": rng.choice([0, 1], n_pos),
        "schema_type_count": rng.integers(2, 5, n_pos),
        "has_phone": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "has_address": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "has_hours": rng.choice([0, 1], n_pos, p=[0.3, 0.7]),
        "has_rating": rng.choice([0, 1], n_pos, p=[0.3, 0.7]),
        "has_reviews": rng.choice([0, 1], n_pos, p=[0.25, 0.75]),
        "has_services": rng.choice([1], n_pos),
        "has_email": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "has_faq": rng.choice([0, 1], n_pos, p=[0.3, 0.7]),
        "has_geo_info": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "local_business_readiness_score": rng.uniform(0.55, 1.0, n_pos),
        "label": np.ones(n_pos, dtype=int),
    }

    # Low-quality pages (not cited)
    n_neg = 250
    neg = {
        "word_count": rng.integers(50, 600, n_neg),
        "sentence_count": rng.integers(3, 30, n_neg),
        "avg_sentence_length": rng.uniform(5, 15, n_neg),
        "paragraph_count": rng.integers(1, 8, n_neg),
        "avg_paragraph_length": rng.uniform(100, 250, n_neg),
        "factual_density": rng.uniform(0, 0.5, n_neg),
        "numeric_statements": rng.integers(0, 5, n_neg),
        "quotation_count": rng.integers(0, 2, n_neg),
        "citation_count": rng.integers(0, 2, n_neg),
        "external_link_count": rng.integers(0, 3, n_neg),
        "internal_link_count": rng.integers(0, 5, n_neg),
        "image_count": rng.integers(0, 3, n_neg),
        "list_count": rng.integers(0, 2, n_neg),
        "table_count": rng.integers(0, 1, n_neg),
        "emphasis_count": rng.integers(0, 5, n_neg),
        "emphasis_density": rng.uniform(0, 0.2, n_neg),
        "h1_count": rng.integers(0, 2, n_neg),
        "h2_count": rng.integers(0, 3, n_neg),
        "h3_count": rng.integers(0, 3, n_neg),
        "heading_count": rng.integers(0, 6, n_neg),
        "heading_depth": rng.integers(0, 3, n_neg),
        "hierarchy_consistent": rng.choice([0, 1], n_neg, p=[0.6, 0.4]),
        "section_count": rng.integers(1, 4, n_neg),
        "avg_paras_per_section": rng.uniform(0.5, 3, n_neg),
        "format_diversity": rng.integers(0, 3, n_neg),
        "macro_structure_score": rng.uniform(0, 0.5, n_neg),
        "meso_structure_score": rng.uniform(0, 0.5, n_neg),
        "micro_structure_score": rng.uniform(0, 0.4, n_neg),
        "schema_present": rng.choice([0], n_neg),
        "local_business_schema": rng.choice([0], n_neg),
        "faq_schema": rng.choice([0], n_neg),
        "organization_schema": rng.choice([0], n_neg),
        "article_schema": rng.choice([0], n_neg),
        "schema_type_count": rng.integers(0, 2, n_neg),
        "has_phone": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_address": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_hours": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_rating": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_reviews": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_services": rng.choice([0, 1], n_neg, p=[0.7, 0.3]),
        "has_email": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_faq": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "has_geo_info": rng.choice([0, 1], n_neg, p=[0.8, 0.2]),
        "local_business_readiness_score": rng.uniform(0, 0.4, n_neg),
        "label": np.zeros(n_neg, dtype=int),
    }

    df = pd.concat([pd.DataFrame(pos), pd.DataFrame(neg)], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Quick evaluation
    from sklearn.metrics import accuracy_score, roc_auc_score
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    logger.info("Demo model – Accuracy=%.3f  AUC=%.3f  (synthetic data only)", acc, auc)

    joblib.dump(model, MODEL_PATH)
    with open(COLUMNS_PATH, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    logger.info("Demo model saved to %s", MODEL_PATH)
    return model, FEATURE_COLUMNS
