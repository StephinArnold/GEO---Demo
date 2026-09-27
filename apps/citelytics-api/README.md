# Citelytics – AI Citation Intelligence

> **College Research Project**  
> Citation Likelihood Prediction in Generative Answer Engines  
> Explainable ML Approach for Local Business Content

---

## Overview

Citelytics predicts how likely a webpage is to be **cited by a generative AI answer engine** (ChatGPT, Perplexity-style systems). Unlike traditional SEO tools that optimise for search ranking, Citelytics uses an **XGBoost + SHAP** pipeline to:

1. Scrape and parse a webpage
2. Extract 44 measurable content and structural features
3. Predict citation likelihood (0–100 score)
4. Explain *why* with SHAP values
5. Generate actionable recommendations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Citelytics                              │
│                                                                 │
│  Frontend (React / TanStack Start / Tailwind v4)               │
│  ├── Landing Page        /citelytics/                          │
│  ├── Analyze URL         /citelytics/analyze                   │
│  ├── Analysis Dashboard  (tabs: Overview / Features / SHAP)    │
│  ├── History             /citelytics/history                   │
│  └── About               /citelytics/about                     │
│                                                                 │
│  Backend (Python / FastAPI)                                     │
│  ├── POST /api/analyze   ← main pipeline                       │
│  ├── GET  /api/history                                         │
│  ├── GET  /api/history/{id}                                    │
│  └── GET  /api/health                                          │
│                                                                 │
│  ML Pipeline                                                    │
│  ├── scraping/     requests + BeautifulSoup                    │
│  ├── features/     44-feature extractor                        │
│  ├── models/       XGBoost (joblib)                            │
│  ├── services/     predictor + explainer (SHAP) + recommender  │
│  └── database/     SQLite (history)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Groups (44 total)

| Group | Count | Examples |
|---|---|---|
| Content | 16 | word_count, factual_density, citation_count, list_count |
| Structural | 13 | heading_depth, format_diversity, macro/meso/micro scores |
| Schema | 8 | schema_present, local_business_schema, faq_schema |
| Local Business | 10 + score | has_phone, has_address, has_hours, readiness_score |
| Meta | 2 | title, meta_description |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19, TanStack Router v1, TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Build tool | Vite 8 + Nitro (SSR) |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Scraping | requests, BeautifulSoup4, lxml |
| ML | XGBoost, scikit-learn, SHAP, pandas, numpy |
| Storage | SQLite (history), joblib (model serialisation) |
| Security | SSRF guard, URL validation, response size limits |

---

## Project Structure

```
getcito-worlds-first-open-source-aio-aeo-or-geo-tool/
│
├── apps/
│   ├── web/                        ← TanStack Start frontend
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── citelytics.tsx         ← layout
│   │       │   └── citelytics/
│   │       │       ├── index.tsx          ← landing page
│   │       │       ├── analyze.tsx        ← analysis dashboard
│   │       │       ├── history.tsx        ← history table
│   │       │       └── about.tsx          ← about / research
│   │       ├── components/citelytics/
│   │       │   ├── citation-gauge.tsx     ← SVG score gauge
│   │       │   ├── shap-chart.tsx         ← SHAP bar chart
│   │       │   ├── feature-card.tsx       ← feature detail cards
│   │       │   ├── recommendation-list.tsx
│   │       │   ├── local-business-readiness.tsx
│   │       │   └── structural-radar.tsx   ← radar chart
│   │       └── lib/
│   │           └── citelytics-api.ts      ← typed API client
│   │
│   └── citelytics-api/             ← Python FastAPI backend
│       ├── main.py                 ← FastAPI app entry
│       ├── requirements.txt
│       ├── api/
│       │   ├── routes.py
│       │   ├── analyze.py          ← POST /api/analyze
│       │   ├── history.py          ← GET /api/history
│       │   └── health.py           ← GET /api/health
│       ├── scraping/
│       │   └── scraper.py          ← fetch + parse
│       ├── features/
│       │   └── extractor.py        ← 44-feature extraction
│       ├── services/
│       │   ├── predictor.py        ← XGBoost inference
│       │   ├── explainer.py        ← SHAP TreeExplainer
│       │   └── recommender.py      ← rule-based recommendations
│       ├── models/
│       │   ├── loader.py           ← load/seed demo model
│       │   ├── citation_model.pkl  ← saved XGBoost model
│       │   └── feature_columns.json
│       ├── database/
│       │   └── db.py               ← SQLite CRUD
│       ├── utils/
│       │   └── ssrf_guard.py       ← SSRF protection
│       ├── ml/
│       │   ├── train.py            ← training script
│       │   └── data/               ← CSV datasets
│       └── data/
│           └── citelytics.db       ← SQLite (auto-created)
```

---

## Installation

### Prerequisites

- Node.js 24.x (enforced by `.nvmrc`)
- pnpm 9+
- Python 3.10–3.12
- PostgreSQL 16 (for the existing GetCito app, not required for Citelytics alone)

---

## Running Citelytics

### 1. Python Backend

```bash
cd apps/citelytics-api

# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

The backend will:
- Auto-generate a **demo XGBoost model** from synthetic data on first run
- Save it to `models/citation_model.pkl`
- Create an SQLite database at `data/citelytics.db`

Backend will be available at: **http://localhost:8000**  
Interactive API docs at: **http://localhost:8000/docs**

### 2. Frontend (Web App)

```bash
# From the monorepo root
cp .env.example .env.local        # fill in DATABASE_URL + BETTER_AUTH_SECRET
cp .env.local apps/web/.env.local

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Frontend at: **http://localhost:3000/citelytics/**

---

## Training the Model

### With synthetic demo data (default)

The model is auto-generated on first backend start. To retrain explicitly:

```bash
cd apps/citelytics-api
python ml/train.py
```

### With real citation data

Prepare a CSV with these columns:

```
url, word_count, sentence_count, avg_sentence_length, paragraph_count,
avg_paragraph_length, factual_density, numeric_statements, quotation_count,
citation_count, external_link_count, internal_link_count, image_count,
list_count, table_count, emphasis_count, emphasis_density, h1_count,
h2_count, h3_count, heading_count, heading_depth, hierarchy_consistent,
section_count, avg_paras_per_section, format_diversity,
macro_structure_score, meso_structure_score, micro_structure_score,
schema_present, local_business_schema, faq_schema, organization_schema,
article_schema, schema_type_count, has_phone, has_address, has_hours,
has_rating, has_reviews, has_services, has_email, has_faq, has_geo_info,
local_business_readiness_score, label
```

Where `label = 1` (cited) or `0` (not cited).

```bash
python ml/train.py --data path/to/your/real_citations.csv
```

---

## API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Liveness check + model status |
| `/api/analyze` | POST | Full citation analysis pipeline |
| `/api/history` | GET | List all saved analyses |
| `/api/history/{id}` | GET | Get single analysis by ID |

### POST /api/analyze

**Request:**
```json
{ "url": "https://example.com/local-business-page" }
```

**Response:**
```json
{
  "id": 1,
  "url": "...",
  "citation_probability": 0.78,
  "citation_score": 78,
  "prediction": "Likely to be cited",
  "prediction_tier": "high",
  "features": { "content": {...}, "structural": {...}, "schema": {...}, "local_business": {...} },
  "shap_values": {
    "top_positive": [{"feature": "schema_present", "label": "Schema Markup", "impact": 0.21}],
    "top_negative": [{"feature": "avg_paragraph_length", "label": "Avg. Paragraph Length", "impact": -0.08}]
  },
  "recommendations": [{"priority": "high", "category": "Schema", "title": "...", "description": "..."}],
  "disclaimer": "Demo model / Research prototype..."
}
```

---

## Limitations

- **Demo model only** — trained on synthetic data, not real AI citation labels
- JavaScript-heavy pages are partially parsed (no headless browser)
- Factual density uses regex heuristics, not NLP
- No real AI engine integration (requires paid/private API)
- Single-page analysis only (not full website)

---

## What Needs to be Replaced for Real Research

| File | Action |
|---|---|
| `models/citation_model.pkl` | Replace with model trained on real citation labels |
| `ml/data/demo_synthetic_data.csv` | Replace with real observed citation dataset |
| `services/explainer.py` | Verify SHAP values match real-data trained model |
| UI disclaimer badges | Update from "Demo model" to production status |

---

## Academic Disclaimer

> The system **estimates** citation likelihood based on learned relationships between
> webpage features and synthetic citation labels. It does **not** guarantee or predict
> the actual behaviour of ChatGPT, Perplexity, or any other AI system.
>
> Correlation between features and citation is not established as causation.
> Model predictions are **experimental estimates** only.

---

## License

MIT — See [LICENSE.md](../../LICENSE.md)
