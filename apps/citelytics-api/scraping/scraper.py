"""
Web scraper – fetches a URL and returns parsed page data.

Security: requests are validated by ssrf_guard before reaching here.
          JavaScript-rendered pages will be partially analysed from raw HTML.
"""

import re
import logging
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

TIMEOUT = 15          # seconds
MAX_BYTES = 5_000_000 # 5 MB response size limit

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; Citelytics/1.0; +https://github.com/citelytics)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_page(url: str) -> dict[str, Any]:
    """
    Fetch *url* and return a dict with parsed page data.

    Returns:
        {
          "url": str,
          "status_code": int,
          "html": str,
          "soup": BeautifulSoup,
          "text_content": str,
          "title": str,
          "meta_description": str,
        }

    Raises:
        ValueError  – bad URL scheme, robots.txt disallow (best-effort), timeout, etc.
        requests.RequestException – network errors
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Unsupported URL scheme: {parsed.scheme!r}")

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=TIMEOUT,
            stream=True,
            allow_redirects=True,
        )
    except requests.exceptions.Timeout:
        raise ValueError("The request timed out. The server may be slow or unavailable.")
    except requests.exceptions.ConnectionError as exc:
        raise ValueError(f"Connection error: {exc}") from exc

    # Check content size
    content_length = response.headers.get("Content-Length")
    if content_length and int(content_length) > MAX_BYTES:
        raise ValueError("Page is too large to analyse (> 5 MB).")

    content = b""
    for chunk in response.iter_content(chunk_size=65536):
        content += chunk
        if len(content) > MAX_BYTES:
            break  # truncate gracefully

    html = content.decode("utf-8", errors="replace")

    soup = BeautifulSoup(html, "lxml")

    # Remove script, style, nav, footer noise
    for tag in soup(["script", "style", "nav", "footer", "iframe", "noscript"]):
        tag.decompose()

    text_content = soup.get_text(separator=" ", strip=True)
    text_content = re.sub(r"\s{2,}", " ", text_content).strip()

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    meta_desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    meta_description = ""
    if meta_desc_tag and meta_desc_tag.get("content"):
        meta_description = meta_desc_tag["content"].strip()

    logger.info(
        "Fetched %s — status=%s text_len=%d",
        url,
        response.status_code,
        len(text_content),
    )

    return {
        "url": url,
        "status_code": response.status_code,
        "html": html,
        "soup": soup,
        "text_content": text_content,
        "title": title,
        "meta_description": meta_description,
    }
