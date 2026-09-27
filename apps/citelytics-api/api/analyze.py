"""
/api/analyze  – Main analysis endpoint.

POST /api/analyze  { "url": "https://example.com/page" }
→ Returns features, prediction, SHAP values, recommendations.
"""

import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

from scraping.scraper import fetch_page
from features.extractor import extract_all_features
from services.predictor import predict_citation_likelihood
from services.explainer import explain_prediction
from services.recommender import generate_recommendations
from database.db import save_analysis

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    url: str  # We validate manually to give friendly errors


@router.post("/analyze")
async def analyze_url(request: AnalyzeRequest):
    """
    Full citation-likelihood pipeline:
      1. Validate URL
      2. Fetch & parse webpage
      3. Extract features
      4. Predict with XGBoost
      5. Generate SHAP explanation
      6. Generate recommendations
      7. Persist to history
    """
    url = request.url.strip()

    # ── 1. Validate URL ──────────────────────────────────────────────────────
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=422, detail="URL must start with http:// or https://")

    # SSRF guard: block private / loopback addresses
    from utils.ssrf_guard import is_safe_url
    if not is_safe_url(url):
        raise HTTPException(
            status_code=422,
            detail="Requests to private IP ranges, localhost, or cloud-metadata endpoints are not allowed.",
        )

    # ── 2. Fetch webpage ─────────────────────────────────────────────────────
    try:
        page_data = fetch_page(url)
    except Exception as exc:
        logger.warning("Fetch failed for %s: %s", url, exc)
        raise HTTPException(status_code=422, detail=f"Could not fetch webpage: {exc}") from exc

    if not page_data.get("text_content"):
        raise HTTPException(
            status_code=422,
            detail=(
                "We couldn't extract enough readable content from this webpage. "
                "Try another publicly accessible page."
            ),
        )

    # ── 3. Extract features ──────────────────────────────────────────────────
    features = extract_all_features(page_data)

    # ── 4. Predict ───────────────────────────────────────────────────────────
    prediction_result = predict_citation_likelihood(features)

    # ── 5. SHAP explanation ──────────────────────────────────────────────────
    shap_result = explain_prediction(features)

    # ── 6. Recommendations ───────────────────────────────────────────────────
    recommendations = generate_recommendations(features, shap_result)

    # ── 7. Persist ───────────────────────────────────────────────────────────
    analysis_id = save_analysis(
        url=url,
        citation_probability=prediction_result["citation_probability"],
        prediction=prediction_result["prediction"],
        features=features,
        shap_values=shap_result,
        recommendations=recommendations,
    )

    return {
        "id": analysis_id,
        "url": url,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "citation_probability": prediction_result["citation_probability"],
        "citation_score": prediction_result["citation_score"],
        "prediction": prediction_result["prediction"],
        "prediction_tier": prediction_result["prediction_tier"],
        "features": features,
        "shap_values": shap_result,
        "recommendations": recommendations,
        "disclaimer": "Demo model / Research prototype – prediction is an estimate based on the trained model and extracted webpage features.",
    }
