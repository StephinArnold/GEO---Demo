"""
Citelytics – Citation Likelihood Prediction API
FastAPI backend for the Citelytics college research project.

This file wires together:
  • The FastAPI app
  • CORS middleware
  • Route registration
  • Database initialisation (SQLite)
  • Model loading (or demo-model seeding on first run)
"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from database.db import init_db
from models.loader import ensure_model_ready

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown logic."""
    logger.info("🚀  Citelytics API starting …")
    init_db()
    ensure_model_ready()
    yield
    logger.info("🛑  Citelytics API shutting down.")


app = FastAPI(
    title="Citelytics API",
    description=(
        "Citation Likelihood Prediction for Generative Answer Engines.\n\n"
        "**Research Prototype** – predictions are estimates based on a demo XGBoost "
        "model trained on synthetic data. Replace `models/citation_model.pkl` with "
        "a model trained on real citation labels to improve accuracy."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/", tags=["health"])
async def root():
    return {
        "service": "Citelytics API",
        "status": "ok",
        "docs": "/docs",
    }
