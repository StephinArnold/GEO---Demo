#!/usr/bin/env bash
# Citelytics API – startup script (macOS / Linux)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f ".venv/bin/uvicorn" ]; then
    echo "[ERROR] Virtual environment not found."
    echo "Run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
    exit 1
fi

echo "Starting Citelytics API on http://localhost:8000 ..."
echo "Docs: http://localhost:8000/docs"
echo ""
.venv/bin/uvicorn main:app --reload --port 8000 --host 0.0.0.0
