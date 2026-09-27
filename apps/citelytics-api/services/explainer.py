"""
SHAP explainability service.

Computes SHAP values for a single prediction and returns
positive + negative factor lists for display.
"""

import logging
from typing import Any

import numpy as np
import pandas as pd
import shap

from models.loader import get_model, get_feature_columns

logger = logging.getLogger(__name__)


def _flatten_features(features: dict[str, Any]) -> dict[str, float]:
    flat: dict[str, float] = {}
    for section_val in features.values():
        if isinstance(section_val, dict):
            for k, v in section_val.items():
                if isinstance(v, (int, float)):
                    flat[k] = float(v)
    return flat


# Human-readable feature names
FEATURE_LABELS = {
    "word_count": "Word Count",
    "sentence_count": "Sentence Count",
    "avg_sentence_length": "Avg. Sentence Length",
    "paragraph_count": "Paragraph Count",
    "avg_paragraph_length": "Avg. Paragraph Length",
    "factual_density": "Factual Density",
    "numeric_statements": "Numeric Statements",
    "quotation_count": "Quotations",
    "citation_count": "In-text Citations",
    "external_link_count": "External Links",
    "internal_link_count": "Internal Links",
    "image_count": "Images",
    "list_count": "Lists",
    "table_count": "Tables",
    "emphasis_count": "Emphasis Elements",
    "emphasis_density": "Emphasis Density",
    "h1_count": "H1 Tags",
    "h2_count": "H2 Tags",
    "h3_count": "H3 Tags",
    "heading_count": "Total Headings",
    "heading_depth": "Heading Depth",
    "hierarchy_consistent": "Heading Hierarchy",
    "section_count": "Section Count",
    "avg_paras_per_section": "Avg. Paragraphs / Section",
    "format_diversity": "Format Diversity",
    "macro_structure_score": "Macro Structure",
    "meso_structure_score": "Meso Structure",
    "micro_structure_score": "Micro Structure",
    "schema_present": "Schema Markup",
    "local_business_schema": "LocalBusiness Schema",
    "faq_schema": "FAQ Schema",
    "organization_schema": "Organization Schema",
    "article_schema": "Article Schema",
    "schema_type_count": "Schema Type Count",
    "has_phone": "Phone Number",
    "has_address": "Address",
    "has_hours": "Opening Hours",
    "has_rating": "Ratings",
    "has_reviews": "Reviews",
    "has_services": "Services Listed",
    "has_email": "Email Contact",
    "has_faq": "FAQ Section",
    "has_geo_info": "Geographic Info",
    "local_business_readiness_score": "Local Business Readiness",
}


def explain_prediction(features: dict[str, Any]) -> dict[str, Any]:
    """
    Run SHAP on a single sample.

    Returns:
        {
          "shap_values": {feature: shap_value, ...},
          "top_positive": [{feature, label, value, impact}, ...],
          "top_negative": [{feature, label, value, impact}, ...],
          "base_value": float,
        }
    """
    model = get_model()
    feature_cols = get_feature_columns()

    if model is None:
        return {"shap_values": {}, "top_positive": [], "top_negative": [], "base_value": 0.5}

    flat = _flatten_features(features)
    row = {col: flat.get(col, 0.0) for col in feature_cols}
    df = pd.DataFrame([row])

    try:
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(df)

        # XGBoost with shap returns shape (1, n_features) for binary classification
        if isinstance(shap_vals, list):
            values = shap_vals[1][0]  # class=1 (cited)
        else:
            values = shap_vals[0]

        base_value = float(explainer.expected_value)
        if isinstance(explainer.expected_value, (list, np.ndarray)):
            base_value = float(explainer.expected_value[-1])

        shap_dict = {col: round(float(v), 5) for col, v in zip(feature_cols, values)}

        # Top positive contributors
        positive = sorted(
            [{"feature": k, "label": FEATURE_LABELS.get(k, k), "value": flat.get(k, 0), "impact": v}
             for k, v in shap_dict.items() if v > 0],
            key=lambda x: x["impact"],
            reverse=True,
        )[:8]

        # Top negative contributors
        negative = sorted(
            [{"feature": k, "label": FEATURE_LABELS.get(k, k), "value": flat.get(k, 0), "impact": v}
             for k, v in shap_dict.items() if v < 0],
            key=lambda x: x["impact"],
        )[:8]

        return {
            "shap_values": shap_dict,
            "top_positive": positive,
            "top_negative": negative,
            "base_value": round(base_value, 5),
        }

    except Exception as exc:
        logger.error("SHAP explanation failed: %s", exc)
        return {"shap_values": {}, "top_positive": [], "top_negative": [], "base_value": 0.5}
