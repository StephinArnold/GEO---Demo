"""
Mock citation engine for development.

The architecture is designed so that a real engine can be plugged in later.
"""

from abc import ABC, abstractmethod
import random


class CitationEngine(ABC):
    @abstractmethod
    def get_citation_label(self, url: str, query: str) -> int:
        """Return 1 if url appears as cited source for query, else 0."""
        ...


class MockCitationEngine(CitationEngine):
    """
    Development / demo stub.
    Returns a probabilistic label based on a simple heuristic.
    NOT connected to any real AI system.
    """

    def __init__(self, seed: int = 42):
        random.seed(seed)

    def get_citation_label(self, url: str, query: str) -> int:
        """
        Simulates a citation check.
        Replace this with a real API call when available.
        """
        # Simple hash-based reproducibility
        combined = hash(url + query) % 100
        return 1 if combined < 45 else 0


class RealCitationEngine(CitationEngine):
    """
    Placeholder for a real citation engine.

    To implement:
    1. Generate a relevant query from the URL / page content.
    2. Send the query to a supported generative AI API.
    3. Check whether the target URL appears in cited sources.
    4. Return 1 or 0.

    Different AI platforms have different API access / terms of service.
    Always check ToS before automated querying.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_citation_label(self, url: str, query: str) -> int:
        raise NotImplementedError(
            "RealCitationEngine is a placeholder. "
            "Implement API calls to your chosen generative AI system."
        )


# Default engine to use
default_engine = MockCitationEngine()
