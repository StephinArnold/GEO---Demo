"""
Recommendation engine – generates actionable suggestions based on
extracted features and SHAP results.

Recommendations are always derived from real detected feature values,
never from generic unrelated heuristics.
"""

from typing import Any


RECOMMENDATIONS = [
    # Schema
    {
        "id": "add_schema",
        "condition": lambda f, _s: f["schema"]["schema_present"] == 0,
        "priority": "high",
        "category": "Schema",
        "title": "Add Schema.org structured data",
        "description": (
            "No structured data markup was detected. Consider adding relevant "
            "Schema.org JSON-LD markup (e.g. LocalBusiness, Organization, FAQPage, Article) "
            "to improve machine-readable page structure for AI answer engines."
        ),
        "impact": "High",
    },
    {
        "id": "add_local_business_schema",
        "condition": lambda f, _s: f["schema"]["schema_present"] == 1 and f["schema"]["local_business_schema"] == 0,
        "priority": "medium",
        "category": "Schema",
        "title": "Add LocalBusiness schema",
        "description": (
            "You have structured data, but no LocalBusiness schema type was detected. "
            "Adding LocalBusiness (or a subtype like Restaurant, Hotel, MedicalOrganization) "
            "can improve citation potential for local search queries."
        ),
        "impact": "Medium",
    },
    {
        "id": "add_faq_schema",
        "condition": lambda f, _s: f["schema"]["faq_schema"] == 0,
        "priority": "medium",
        "category": "Schema",
        "title": "Consider adding FAQ schema",
        "description": (
            "No FAQPage schema was detected. Adding FAQ structured data with relevant "
            "questions and answers can directly surface in AI-generated answers."
        ),
        "impact": "Medium",
    },
    # Content – factual density
    {
        "id": "increase_factual_density",
        "condition": lambda f, _s: f["content"]["factual_density"] < 0.5,
        "priority": "high",
        "category": "Content",
        "title": "Increase factual content density",
        "description": (
            "The estimated factual density of this page is low. Consider adding "
            "specific, verifiable facts: statistics, dates, measurements, named entities, "
            "or credible external references where appropriate."
        ),
        "impact": "High",
    },
    # Content – word count
    {
        "id": "expand_content",
        "condition": lambda f, _s: f["content"]["word_count"] < 400,
        "priority": "high",
        "category": "Content",
        "title": "Expand page content",
        "description": (
            f"The page has low word count, which is associated with lower citation "
            "likelihood. Consider expanding the content with more detailed information "
            "about your topic, services, or business."
        ),
        "impact": "High",
    },
    # Structure – headings
    {
        "id": "improve_headings",
        "condition": lambda f, _s: f["structural"]["heading_count"] < 3,
        "priority": "medium",
        "category": "Structure",
        "title": "Improve heading hierarchy",
        "description": (
            "The page has few headings. Use a clear H1 → H2 → H3 hierarchy to "
            "organize content into logical sections. Well-structured pages are "
            "more easily parsed by AI systems."
        ),
        "impact": "Medium",
    },
    {
        "id": "fix_hierarchy",
        "condition": lambda f, _s: f["structural"]["hierarchy_consistent"] == 0,
        "priority": "low",
        "category": "Structure",
        "title": "Fix heading hierarchy inconsistencies",
        "description": (
            "Heading hierarchy violations were detected (e.g. skipping from H1 to H3). "
            "A consistent, logical heading structure improves AI parsing and readability."
        ),
        "impact": "Low",
    },
    # Structure – long paragraphs
    {
        "id": "break_paragraphs",
        "condition": lambda f, _s: f["content"]["avg_paragraph_length"] > 120,
        "priority": "medium",
        "category": "Readability",
        "title": "Break up long paragraphs",
        "description": (
            "Average paragraph length is high. Break long paragraphs into shorter "
            "sections (50–90 words each). Shorter paragraphs improve readability and "
            "are more likely to be directly quoted by AI systems."
        ),
        "impact": "Medium",
    },
    # Format diversity
    {
        "id": "add_format_diversity",
        "condition": lambda f, _s: f["structural"]["format_diversity"] < 2,
        "priority": "low",
        "category": "Structure",
        "title": "Add format variety",
        "description": (
            "The page uses few formatting elements. Consider adding bullet lists, "
            "numbered lists, tables, or blockquotes where relevant. Format diversity "
            "improves scannability for AI systems."
        ),
        "impact": "Low",
    },
    # External links
    {
        "id": "add_external_links",
        "condition": lambda f, _s: f["content"]["external_link_count"] < 2,
        "priority": "medium",
        "category": "Content",
        "title": "Add credible external references",
        "description": (
            "Few or no external links were found. Linking to authoritative sources "
            "(government sites, established publications, or industry bodies) "
            "signals credibility and may increase citation likelihood."
        ),
        "impact": "Medium",
    },
    # Local business – phone
    {
        "id": "add_phone",
        "condition": lambda f, _s: f["local_business"]["has_phone"] == 0,
        "priority": "low",
        "category": "Local Business",
        "title": "Add a visible phone number",
        "description": (
            "No phone number was detected. For local business pages, displaying "
            "contact information increases completeness and trustworthiness."
        ),
        "impact": "Low",
    },
    # Local business – address
    {
        "id": "add_address",
        "condition": lambda f, _s: f["local_business"]["has_address"] == 0,
        "priority": "low",
        "category": "Local Business",
        "title": "Add a physical address",
        "description": (
            "No physical address was detected. Adding a full address strengthens "
            "local relevance signals and enables AI systems to cite the page for "
            "location-based queries."
        ),
        "impact": "Low",
    },
    # Local business – opening hours
    {
        "id": "add_hours",
        "condition": lambda f, _s: f["local_business"]["has_hours"] == 0,
        "priority": "low",
        "category": "Local Business",
        "title": "Add opening hours",
        "description": (
            "Opening hours were not detected. This is one of the most commonly "
            "queried facts for local businesses. Display hours clearly in text "
            "and in LocalBusiness schema."
        ),
        "impact": "Low",
    },
    # FAQ
    {
        "id": "add_faq",
        "condition": lambda f, _s: f["local_business"]["has_faq"] == 0,
        "priority": "medium",
        "category": "Content",
        "title": "Add an FAQ section",
        "description": (
            "No FAQ section was detected. Frequently asked questions directly match "
            "the question-and-answer format of generative AI responses, making them "
            "high-value content for citation."
        ),
        "impact": "Medium",
    },
]


def generate_recommendations(
    features: dict[str, Any],
    shap_result: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Evaluate every recommendation rule against the extracted features
    and return triggered recommendations, sorted by priority.
    """
    priority_order = {"high": 0, "medium": 1, "low": 2}
    triggered = []

    for rec in RECOMMENDATIONS:
        try:
            if rec["condition"](features, shap_result):
                triggered.append({
                    "id": rec["id"],
                    "priority": rec["priority"],
                    "category": rec["category"],
                    "title": rec["title"],
                    "description": rec["description"],
                    "impact": rec["impact"],
                })
        except Exception:
            pass  # defensive – bad feature access shouldn't crash pipeline

    triggered.sort(key=lambda r: priority_order.get(r["priority"], 3))
    return triggered
