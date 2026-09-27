"""
SHAP explainability module.

Computes SHAP values for a single prediction and returns
top positive/negative features as dicts.
"""

import logging
import numpy as np
import pandas as pd
import shap

logger = logging.getLogger("citelytics.shap")


def explain(model, feat_cols: list, feature_values: dict) -> dict:
    """
    Returns:
      - shap_values: {feature_name: shap_value} for all features
      - top_positive: list of {feature, value, shap_value} sorted desc
      - top_negative: list of {feature, value, shap_value} sorted asc
      - base_value: float (expected model output)
    """
    row = pd.DataFrame([{col: feature_values.get(col, 0) for col in feat_cols}])

    explainer   = shap.TreeExplainer(model)
    shap_output = explainer(row)

    # shap_output.values has shape (1, n_features) or (1, n_features, 2) for multi-class
    raw = shap_output.values[0]
    if raw.ndim > 1:
        raw = raw[:, 1]   # pick positive-class shap

    base = float(shap_output.base_values[0])
    if isinstance(base, (list, np.ndarray)):
        base = float(base[1])

    sv_dict = {col: round(float(v), 5) for col, v in zip(feat_cols, raw)}

    sorted_items = sorted(sv_dict.items(), key=lambda x: x[1], reverse=True)

    top_positive = [
        {"feature": k, "value": feature_values.get(k, 0), "shap_value": v}
        for k, v in sorted_items if v > 0
    ][:8]

    top_negative = [
        {"feature": k, "value": feature_values.get(k, 0), "shap_value": v}
        for k, v in sorted_items if v < 0
    ][:8]
    top_negative.sort(key=lambda x: x["shap_value"])

    return {
        "shap_values":    sv_dict,
        "top_positive":   top_positive,
        "top_negative":   top_negative,
        "base_value":     round(base, 5),
    }
