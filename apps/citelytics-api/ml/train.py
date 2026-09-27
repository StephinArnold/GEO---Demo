"""
ml/train.py – Train the XGBoost citation classifier.

Usage:
    python ml/train.py                        # train on demo synthetic data
    python ml/train.py --data path/to/data.csv  # train on real CSV

CSV format expected:
    url, schema_present, local_business_schema, word_count, ...
    (see FEATURE_COLUMNS below for all 44 columns + label)
"""

import argparse
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ROOT = Path(__file__).parent.parent
MODEL_DIR = ROOT / "models"
DATA_DIR = ROOT / "ml" / "data"

FEATURE_COLUMNS = [
    "word_count", "sentence_count", "avg_sentence_length", "paragraph_count",
    "avg_paragraph_length", "factual_density", "numeric_statements",
    "quotation_count", "citation_count", "external_link_count",
    "internal_link_count", "image_count", "list_count", "table_count",
    "emphasis_count", "emphasis_density", "h1_count", "h2_count", "h3_count",
    "heading_count", "heading_depth", "hierarchy_consistent", "section_count",
    "avg_paras_per_section", "format_diversity", "macro_structure_score",
    "meso_structure_score", "micro_structure_score", "schema_present",
    "local_business_schema", "faq_schema", "organization_schema",
    "article_schema", "schema_type_count", "has_phone", "has_address",
    "has_hours", "has_rating", "has_reviews", "has_services", "has_email",
    "has_faq", "has_geo_info", "local_business_readiness_score",
]


def load_real_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    missing = [c for c in FEATURE_COLUMNS + ["label"] if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing columns: {missing}")
    return df


def generate_synthetic_data(n: int = 600) -> pd.DataFrame:
    """
    Generate synthetic labeled data for demo purposes.

    ⚠️  NOT real citation data. Replace with real labels for research.
    """
    logger.warning("Using SYNTHETIC demo data — not real citation labels!")
    rng = np.random.default_rng(42)
    n_pos = n // 2
    n_neg = n - n_pos

    # ── positive class (cited) ─────────────────────────────────────────────
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
        "hierarchy_consistent": np.ones(n_pos, dtype=int),
        "section_count": rng.integers(4, 12, n_pos),
        "avg_paras_per_section": rng.uniform(3, 6, n_pos),
        "format_diversity": rng.integers(3, 7, n_pos),
        "macro_structure_score": rng.uniform(0.6, 1.0, n_pos),
        "meso_structure_score": rng.uniform(0.5, 1.0, n_pos),
        "micro_structure_score": rng.uniform(0.4, 0.9, n_pos),
        "schema_present": np.ones(n_pos, dtype=int),
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
        "has_services": np.ones(n_pos, dtype=int),
        "has_email": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "has_faq": rng.choice([0, 1], n_pos, p=[0.3, 0.7]),
        "has_geo_info": rng.choice([0, 1], n_pos, p=[0.2, 0.8]),
        "local_business_readiness_score": rng.uniform(0.55, 1.0, n_pos),
        "label": np.ones(n_pos, dtype=int),
    }

    # ── negative class (not cited) ─────────────────────────────────────────
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
        "schema_present": np.zeros(n_neg, dtype=int),
        "local_business_schema": np.zeros(n_neg, dtype=int),
        "faq_schema": np.zeros(n_neg, dtype=int),
        "organization_schema": np.zeros(n_neg, dtype=int),
        "article_schema": np.zeros(n_neg, dtype=int),
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
    return df.sample(frac=1, random_state=42).reset_index(drop=True)


def train_and_evaluate(df: pd.DataFrame):
    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    logger.info("Train: %d  Test: %d", len(X_train), len(X_test))

    model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    logger.info("=" * 50)
    logger.info("EVALUATION RESULTS")
    logger.info("=" * 50)
    logger.info("Accuracy:  %.4f", accuracy_score(y_test, y_pred))
    logger.info("Precision: %.4f", precision_score(y_test, y_pred))
    logger.info("Recall:    %.4f", recall_score(y_test, y_pred))
    logger.info("F1-Score:  %.4f", f1_score(y_test, y_pred))
    logger.info("ROC-AUC:   %.4f", roc_auc_score(y_test, y_prob))
    logger.info("\nClassification Report:\n%s", classification_report(y_test, y_pred))
    logger.info("Confusion Matrix:\n%s", confusion_matrix(y_test, y_pred))

    return model


def main():
    parser = argparse.ArgumentParser(description="Train Citelytics XGBoost model")
    parser.add_argument("--data", type=str, default=None, help="Path to real CSV data file")
    parser.add_argument("--n", type=int, default=600, help="Synthetic dataset size (if no --data)")
    args = parser.parse_args()

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if args.data:
        logger.info("Loading real data from %s", args.data)
        df = load_real_data(args.data)
    else:
        logger.warning("No real data provided. Using synthetic demo data (n=%d).", args.n)
        df = generate_synthetic_data(args.n)
        # Save demo dataset for reference
        demo_path = DATA_DIR / "demo_synthetic_data.csv"
        df.to_csv(demo_path, index=False)
        logger.info("Demo data saved to %s", demo_path)

    model = train_and_evaluate(df)

    # Save model
    model_path = MODEL_DIR / "citation_model.pkl"
    joblib.dump(model, model_path)
    logger.info("Model saved to %s", model_path)

    # Save feature columns
    columns_path = MODEL_DIR / "feature_columns.json"
    with open(columns_path, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)
    logger.info("Feature columns saved to %s", columns_path)


if __name__ == "__main__":
    main()
