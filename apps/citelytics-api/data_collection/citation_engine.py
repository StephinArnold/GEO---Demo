#!/usr/bin/env python3
"""
Citation data collection module.

Architecture:
  CitationEngine (abstract)
  ├── MockCitationEngine  – returns random labels for testing
  └── RealCitationEngine  – plug in your API integration here

Usage:
    from data_collection.citation_engine import MockCitationEngine

    engine = MockCitationEngine()
    label = engine.check_citation("https://example.com/page", "best restaurant in london")
    # label = 1 (cited) or 0 (not cited)
"""

from abc import ABC, abstractmethod
import random
import logging

logger = logging.getLogger(__name__)


class CitationEngine(ABC):
    """Abstract base for citation label collection."""

    @abstractmethod
    def generate_query(self, url: str, page_title: str = "") -> str:
        """Generate a relevant query for the given webpage."""

    @abstractmethod
    def check_citation(self, url: str, query: str) -> int:
        """
        Check if *url* appears as a cited source for *query*.

        Returns:
            1  – page was cited
            0  – page was not cited
        """


class MockCitationEngine(CitationEngine):
    """
    Mock engine for development and testing.

    Returns a random label (biased toward 0 to simulate typical low citation rates).
    ⚠️  Do NOT use for real research. Replace with RealCitationEngine.
    """

    def __init__(self, citation_rate: float = 0.3, seed: int | None = None):
        self.citation_rate = citation_rate
        self._rng = random.Random(seed)

    def generate_query(self, url: str, page_title: str = "") -> str:
        if page_title:
            return f"What is {page_title}?"
        domain = url.split("/")[2] if "/" in url else url
        return f"information about {domain}"

    def check_citation(self, url: str, query: str) -> int:
        label = 1 if self._rng.random() < self.citation_rate else 0
        logger.info(
            "[Mock] URL=%s  Query=%r  Label=%d  (synthetic)",
            url, query, label
        )
        return label


class RealCitationEngine(CitationEngine):
    """
    Placeholder for a real AI engine integration.

    To implement:
    1. Pick an AI engine that supports source attribution (e.g. Perplexity API).
    2. Implement generate_query() to produce a relevant search query.
    3. Implement check_citation() to call the API and check if the URL
       appears in the returned citations.
    4. Respect rate limits and terms of service.

    Example pseudocode for Perplexity:
        response = perplexity_client.chat(query)
        cited_urls = [source["url"] for source in response.sources]
        return 1 if url in cited_urls else 0
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        raise NotImplementedError(
            "RealCitationEngine is not yet implemented. "
            "Use MockCitationEngine for development. "
            "See class docstring for implementation guidance."
        )

    def generate_query(self, url: str, page_title: str = "") -> str:
        raise NotImplementedError

    def check_citation(self, url: str, query: str) -> int:
        raise NotImplementedError
