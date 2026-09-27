/**
 * Citelytics service – API client for the Python FastAPI backend.
 * All calls go to http://localhost:8000/api
 */

const BASE_URL = "http://localhost:8000/api";

export interface AnalyzeRequest {
  url: string;
}

export interface ShapFactor {
  feature: string;
  label: string;
  value: number;
  impact: number;
}

export interface ShapResult {
  shap_values: Record<string, number>;
  top_positive: ShapFactor[];
  top_negative: ShapFactor[];
  base_value: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
}

export interface ContentFeatures {
  word_count: number;
  sentence_count: number;
  avg_sentence_length: number;
  paragraph_count: number;
  avg_paragraph_length: number;
  factual_density: number;
  numeric_statements: number;
  quotation_count: number;
  citation_count: number;
  external_link_count: number;
  internal_link_count: number;
  image_count: number;
  list_count: number;
  table_count: number;
  emphasis_count: number;
  emphasis_density: number;
}

export interface StructuralFeatures {
  h1_count: number;
  h2_count: number;
  h3_count: number;
  heading_count: number;
  heading_depth: number;
  hierarchy_consistent: number;
  hierarchy_violations: number;
  section_count: number;
  avg_paras_per_section: number;
  format_diversity: number;
  macro_structure_score: number;
  meso_structure_score: number;
  micro_structure_score: number;
}

export interface SchemaFeatures {
  schema_present: number;
  schema_types: string[];
  schema_type_count: number;
  local_business_schema: number;
  faq_schema: number;
  organization_schema: number;
  article_schema: number;
  product_schema: number;
  breadcrumb_schema: number;
}

export interface LocalBusinessFeatures {
  business_name: string;
  has_phone: number;
  has_address: number;
  has_hours: number;
  has_rating: number;
  has_reviews: number;
  has_services: number;
  has_email: number;
  has_faq: number;
  has_geo_info: number;
  local_business_readiness_score: number;
}

export interface AnalysisResult {
  id: number;
  url: string;
  timestamp: string;
  citation_probability: number;
  citation_score: number;
  prediction: string;
  prediction_tier: "low" | "moderate" | "high" | "very_high";
  features: {
    meta: { title: string; meta_description: string; url: string };
    content: ContentFeatures;
    structural: StructuralFeatures;
    schema: SchemaFeatures;
    local_business: LocalBusinessFeatures;
  };
  shap_values: ShapResult;
  recommendations: Recommendation[];
  disclaimer: string;
}

export interface HistoryItem {
  id: number;
  url: string;
  created_at: string;
  citation_probability: number;
  citation_score: number;
  prediction: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const citelyticsApi = {
  analyze: (url: string): Promise<AnalysisResult> =>
    request<AnalysisResult>("/analyze", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  health: (): Promise<{ status: string; model_ready: boolean }> =>
    request("/health"),

  history: (): Promise<{ analyses: HistoryItem[] }> => request("/history"),

  historyItem: (id: number): Promise<AnalysisResult> =>
    request(`/history/${id}`),
};
