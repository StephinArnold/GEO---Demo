"""
Citelytics Backend — FastAPI Application Entry Point
Citation Likelihood Prediction in Generative Answer Engines
Author: Stephin Arnold (github.com/stephinarnold)
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.analyze import router as analyze_router
from api.history import router as history_router
from api.health import router as health_router
from database.db import init_db
from models.model_loader import load_or_train_model

# ─────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger("citelytics")

# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("🚀  Citelytics backend starting …")
    await init_db()
    load_or_train_model()
    logger.info("✅  Ready.")
    yield
    logger.info("👋  Shutting down.")


app = FastAPI(
    title="Citelytics API",
    description="Citation Likelihood Prediction in Generative Answer Engines — by Stephin Arnold",
    version="1.0.0",
    contact={
        "name": "Stephin Arnold",
        "url": "https://github.com/stephinarnold",
    },
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analyze_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(health_router, prefix="/api")


@app.get("/")
def root():
    return {"service": "Citelytics", "version": "1.0.0", "status": "running"}
