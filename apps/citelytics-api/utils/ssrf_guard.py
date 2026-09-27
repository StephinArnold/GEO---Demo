"""
SSRF guard – rejects requests to private / loopback / cloud-metadata addresses.
"""

import ipaddress
import logging
import socket
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Cloud-metadata well-known endpoints to block
BLOCKED_HOSTS = {
    "169.254.169.254",  # AWS / GCP / Azure metadata
    "metadata.google.internal",
    "metadata",
}

PRIVATE_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("169.254.0.0/16"),
]


def is_safe_url(url: str) -> bool:
    """Return True only if the URL targets a safe, public address."""
    parsed = urlparse(url)
    host = parsed.hostname or ""

    if not host:
        return False

    if host.lower() in BLOCKED_HOSTS:
        logger.warning("SSRF guard blocked host: %s", host)
        return False

    # Resolve to IP and check
    try:
        addr_info = socket.getaddrinfo(host, None)
        for _, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            try:
                ip = ipaddress.ip_address(ip_str)
            except ValueError:
                continue
            if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_reserved:
                logger.warning("SSRF guard blocked IP %s for host %s", ip_str, host)
                return False
    except socket.gaierror:
        # Cannot resolve – allow (will fail at fetch time with a clear error)
        pass

    return True
