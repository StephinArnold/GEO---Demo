"""
Feature extractor – derives all measurable signals from a parsed webpage.

Feature groups:
  • Content features
  • Structural features  (macro / meso / micro)
  • Schema / structured-data features
  • Local business features
"""

import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# ─────────────────────────── helpers ────────────────────────────────────────

_RE_NUM = re.compile(r"\b\d[\d,\.]*%?\b")
_RE_PHONE = re.compile(
    r"(\+?\d[\d\s\-\(\)]{7,}\d)"
)
_RE_HOURS = re.compile(
    r"\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)"
    r"[\s\-–:]+\d",
    re.I,
)
_RE_ADDRESS = re.compile(
    r"\b\d{1,5}\s+\w[\w\s,\.]+\b(street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr|court|ct|way|place|pl)\b",
    re.I,
)
_RE_QUOTE = re.compile(r'["\'"\u201c\u201d\u2018\u2019][^"\'"\u201c\u201d\u2018\u2019]{8,}["\'\u201d\u2019]')
_RE_EXT_CITE = re.compile(r"\[\d+\]|\(\w[\w\s]+,\s*\d{4}\)")


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 10]


def _paragraphs(soup) -> list[str]:
    return [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]


# ─────────────────────────── content features ───────────────────────────────

def extract_content_features(page: dict[str, Any]) -> dict[str, Any]:
    soup = page["soup"]
    text = page["text_content"]
    paragraphs = _paragraphs(soup)
    sentences = _sentences(text)
    words = text.split()

    word_count = len(words)
    sentence_count = len(sentences)
    avg_sentence_len = round(word_count / max(sentence_count, 1), 2)
    para_word_lens = [len(p.split()) for p in paragraphs]
    avg_para_len = round(sum(para_word_lens) / max(len(para_word_lens), 1), 2)

    # Factual signals (heuristic – documented as estimate)
    numbers = _RE_NUM.findall(text)
    factual_count = len(numbers)
    dates = re.findall(r"\b\d{4}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b", text)
    percentages = re.findall(r"\d+\.?\d*\s*%", text)
    external_cites = _RE_EXT_CITE.findall(text)
    quotes = _RE_QUOTE.findall(text)
    factual_signals = factual_count + len(dates) + len(external_cites)
    factual_density = round(min(factual_signals / max(word_count, 1) * 100, 10), 4)

    # Links
    all_links = soup.find_all("a", href=True)
    from urllib.parse import urlparse as _up
    base_domain = _up(page["url"]).netloc
    external_links = [
        a for a in all_links
        if a["href"].startswith("http") and base_domain not in a["href"]
    ]
    internal_links = [
        a for a in all_links
        if not a["href"].startswith("http") or base_domain in a["href"]
    ]

    images = soup.find_all("img")
    lists = soup.find_all(["ul", "ol"])
    list_items = soup.find_all("li")
    tables = soup.find_all("table")
    em_elements = soup.find_all(["strong", "b", "em", "i", "mark"])

    emphasis_density = round(len(em_elements) / max(word_count / 100, 1), 4)

    short_paras = sum(1 for l in para_word_lens if l < 50)
    long_paras = sum(1 for l in para_word_lens if l >= 100)

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": avg_sentence_len,
        "paragraph_count": len(paragraphs),
        "avg_paragraph_length": avg_para_len,
        "short_paragraph_count": short_paras,
        "long_paragraph_count": long_paras,
        # Factual
        "factual_density": factual_density,
        "numeric_statements": factual_count,
        "percentage_count": len(percentages),
        "date_references": len(dates),
        "quotation_count": len(quotes),
        "citation_count": len(external_cites),
        # Links
        "external_link_count": len(external_links),
        "internal_link_count": len(internal_links),
        # Media & format
        "image_count": len(images),
        "list_count": len(lists),
        "list_item_count": len(list_items),
        "table_count": len(tables),
        "emphasis_count": len(em_elements),
        "emphasis_density": emphasis_density,
    }


# ─────────────────────────── structural features ────────────────────────────

def extract_structural_features(page: dict[str, Any]) -> dict[str, Any]:
    soup = page["soup"]

    h1 = soup.find_all("h1")
    h2 = soup.find_all("h2")
    h3 = soup.find_all("h3")
    h4 = soup.find_all("h4")
    h5 = soup.find_all("h5")
    h6 = soup.find_all("h6")

    all_headings = h1 + h2 + h3 + h4 + h5 + h6
    heading_count = len(all_headings)

    # Heading depth: deepest heading level used
    heading_depth = 0
    for i, tags in enumerate([h1, h2, h3, h4, h5, h6], start=1):
        if tags:
            heading_depth = i

    # Hierarchy consistency: H1 → H2 → H3 pattern
    prev_level = 0
    consistency_violations = 0
    for tag in all_headings:
        level = int(tag.name[1])
        if level > prev_level + 1 and prev_level > 0:
            consistency_violations += 1
        prev_level = level
    hierarchy_consistent = 1 if consistency_violations == 0 else 0

    # Section count (heuristic: H2 tags each start a section)
    section_count = max(len(h2), 1)
    paragraphs = soup.find_all("p")
    avg_paras_per_section = round(len(paragraphs) / section_count, 2)

    # Format diversity: how many different format elements are used
    format_types = set()
    for tag_name in ["ul", "ol", "table", "blockquote", "pre", "code", "figure"]:
        if soup.find(tag_name):
            format_types.add(tag_name)
    format_diversity = len(format_types)

    # Macro / Meso / Micro structural scores (0–1 normalized)
    macro_score = round(min((len(h1) > 0) * 0.4 + min(heading_count / 10, 0.4) + min(len(paragraphs) / 20, 0.2), 1.0), 4)
    meso_score = round(min(min(section_count / 5, 0.5) + min(avg_paras_per_section / 6, 0.3) + format_diversity * 0.04, 1.0), 4)

    text = page["text_content"]
    words = text.split()
    sentences = _sentences(text)
    avg_sentence_len = len(words) / max(len(sentences), 1)
    micro_score = round(min(
        (1 if avg_sentence_len < 25 else 0.5) * 0.5
        + min(len(soup.find_all(["strong", "em"])) / max(len(words) / 100, 1), 5) * 0.1,
        1.0,
    ), 4)

    return {
        "h1_count": len(h1),
        "h2_count": len(h2),
        "h3_count": len(h3),
        "h4_count": len(h4),
        "heading_count": heading_count,
        "heading_depth": heading_depth,
        "hierarchy_consistent": hierarchy_consistent,
        "hierarchy_violations": consistency_violations,
        "section_count": section_count,
        "avg_paras_per_section": avg_paras_per_section,
        "format_diversity": format_diversity,
        "macro_structure_score": macro_score,
        "meso_structure_score": meso_score,
        "micro_structure_score": micro_score,
    }


# ─────────────────────────── schema features ────────────────────────────────

_SCHEMA_LOCAL_BUSINESS_TYPES = {
    "localbusiness", "restaurant", "hotel", "medicalorganization",
    "dentist", "hospital", "hairsalon", "spa", "store", "foodestablishment",
    "lodgingbusiness", "touristinformationcenter", "educationalorganization",
    "school", "university", "financialservice", "insuranceagency",
    "realestagelisting",
}


def extract_schema_features(page: dict[str, Any]) -> dict[str, Any]:
    soup = page["soup"]

    # JSON-LD
    json_ld_blocks = soup.find_all("script", type="application/ld+json")
    schema_types: list[str] = []
    for block in json_ld_blocks:
        try:
            data = json.loads(block.string or "")
            if isinstance(data, dict):
                t = data.get("@type", "")
                if isinstance(t, list):
                    schema_types.extend(t)
                elif t:
                    schema_types.append(t)
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        t = item.get("@type", "")
                        if isinstance(t, list):
                            schema_types.extend(t)
                        elif t:
                            schema_types.append(t)
        except (json.JSONDecodeError, AttributeError):
            pass

    # Microdata (itemtype)
    microdata_types = [
        tag.get("itemtype", "").split("/")[-1]
        for tag in soup.find_all(attrs={"itemtype": True})
    ]
    all_types = [t.lower() for t in schema_types + microdata_types if t]

    schema_present = 1 if all_types else 0
    local_business_schema = 1 if any(t in _SCHEMA_LOCAL_BUSINESS_TYPES for t in all_types) else 0
    faq_schema = 1 if any("faq" in t for t in all_types) else 0
    organization_schema = 1 if any(t in {"organization", "corporation", "ngo"} for t in all_types) else 0
    article_schema = 1 if any(t in {"article", "newsarticle", "blogposting"} for t in all_types) else 0
    product_schema = 1 if any(t in {"product", "offer"} for t in all_types) else 0
    breadcrumb_schema = 1 if any("breadcrumb" in t for t in all_types) else 0

    return {
        "schema_present": schema_present,
        "schema_types": list(set(all_types)),
        "schema_type_count": len(set(all_types)),
        "local_business_schema": local_business_schema,
        "faq_schema": faq_schema,
        "organization_schema": organization_schema,
        "article_schema": article_schema,
        "product_schema": product_schema,
        "breadcrumb_schema": breadcrumb_schema,
    }


# ─────────────────────────── local business features ────────────────────────

def extract_local_business_features(page: dict[str, Any]) -> dict[str, Any]:
    text = page["text_content"]
    soup = page["soup"]

    has_phone = 1 if _RE_PHONE.search(text) else 0
    has_address = 1 if _RE_ADDRESS.search(text) else 0
    has_hours = 1 if _RE_HOURS.search(text) else 0

    # Business name heuristic: first H1
    h1 = soup.find("h1")
    business_name = h1.get_text(strip=True) if h1 else ""

    # Ratings / reviews
    rating_pattern = re.compile(r"\b([1-5](\.\d)?)\s*(out of 5|stars?|\/5)\b", re.I)
    review_words = re.compile(r"\b(review|rating|testimonial|feedback)\b", re.I)
    has_rating = 1 if rating_pattern.search(text) else 0
    has_reviews = 1 if review_words.search(text) else 0

    # Services
    service_words = re.compile(r"\b(service|offer|provide|specialize|available)\b", re.I)
    has_services = 1 if service_words.search(text) else 0

    # Contact info
    email_pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    has_email = 1 if email_pattern.search(text) else 0

    # FAQ
    faq_pattern = re.compile(r"\b(faq|frequently asked|common question)\b", re.I)
    has_faq = 1 if faq_pattern.search(text) else 0

    # Geographic info
    geo_pattern = re.compile(r"\b(city|town|district|near|location|located in|serving)\b", re.I)
    has_geo = 1 if geo_pattern.search(text) else 0

    readiness_score = round(
        (has_phone + has_address + has_hours + has_rating + has_services + has_email + has_faq + has_geo)
        / 8.0,
        4,
    )

    return {
        "business_name": business_name,
        "has_phone": has_phone,
        "has_address": has_address,
        "has_hours": has_hours,
        "has_rating": has_rating,
        "has_reviews": has_reviews,
        "has_services": has_services,
        "has_email": has_email,
        "has_faq": has_faq,
        "has_geo_info": has_geo,
        "local_business_readiness_score": readiness_score,
    }


# ─────────────────────────── master extractor ───────────────────────────────

def extract_all_features(page: dict[str, Any]) -> dict[str, Any]:
    """Run all feature extractors and return a consolidated dict."""
    content = extract_content_features(page)
    structural = extract_structural_features(page)
    schema = extract_schema_features(page)
    local_biz = extract_local_business_features(page)

    return {
        "meta": {
            "title": page.get("title", ""),
            "meta_description": page.get("meta_description", ""),
            "url": page.get("url", ""),
        },
        "content": content,
        "structural": structural,
        "schema": schema,
        "local_business": local_biz,
    }
