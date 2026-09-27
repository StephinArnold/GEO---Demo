"""
Standalone model training script.

Run from the project root:
    python ml/training/train.py

Generates data/webpage_features.csv (synthetic demo dataset),
trains an XGBoost model, evaluates it, and saves:
    models/citation_model.pkl
    models/feature_columns.json

Replace the synthetic dataset with real citation labels for
production research.
"""

import os
import sys

# Allow imports relative to backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from models.model_loader import _generate_demo_data, _train, FEATURE_COLUMNS
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import pandas as pd
import numpy as np
import json

print("=" * 60)
print("Citelytics — XGBoost Training Script")
print("=" * 60)

print("\n[1/4] Generating synthetic demo dataset …")
df = _generate_demo_data(n_samples=500)
print(f"      Dataset: {len(df)} rows, {len(FEATURE_COLUMNS)} features, label distribution:")
print(f"      cited=1: {df['label'].sum()}  |  not-cited=0: {(df['label'] == 0).sum()}")

print("\n[2/4] Training XGBoost model …")
model = _train(df)

print("\n[3/4] Evaluation …")
X = df[FEATURE_COLUMNS]
y = df["label"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
y_pred  = model.predict(X_te)
y_proba = model.predict_proba(X_te)[:, 1]

print("\nClassification Report:")
print(classification_report(y_te, y_pred, target_names=["Not Cited", "Cited"]))
print("Confusion Matrix:")
print(confusion_matrix(y_te, y_pred))
print(f"ROC-AUC: {roc_auc_score(y_te, y_proba):.4f}")

print("\n[4/4] Files saved:")
print("      models/citation_model.pkl")
print("      models/feature_columns.json")
print("      ml/data/webpage_features.csv")

print("\n✅  Done! The backend will auto-load this model on next startup.")
print("\n⚠   IMPORTANT: This model was trained on SYNTHETIC data.")
print("    Replace ml/data/webpage_features.csv with real citation")
print("    observations before using in research.")
