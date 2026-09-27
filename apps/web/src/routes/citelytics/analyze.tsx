/**
 * Citelytics – Analyze URL page
 * Route: /citelytics/analyze
 *
 * Accepts ?url= from home page, runs analysis, shows live progress,
 * then renders the full dashboard on completion.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { citelyticsApi, type AnalysisResult } from "@/lib/citelytics-api";
import { CitationGauge } from "@/components/citelytics/citation-gauge";
import { ShapChart } from "@/components/citelytics/shap-chart";
import { FeatureCard } from "@/components/citelytics/feature-card";
import { RecommendationList } from "@/components/citelytics/recommendation-list";
import { LocalBusinessReadiness } from "@/components/citelytics/local-business-readiness";
import { StructuralRadar } from "@/components/citelytics/structural-radar";

export const Route = createFileRoute("/citelytics/analyze")({
	validateSearch: z.object({ url: z.string().optional() }),
	component: AnalyzePage,
});

type Step = {
	label: string;
	done: boolean;
	active: boolean;
};

const STEPS = [
	"Fetching webpage",
	"Extracting content",
	"Analysing structure",
	"Detecting schema",
	"Running ML model",
	"Generating SHAP explanation",
];

function AnalyzePage() {
	const { url: searchUrl } = Route.useSearch();
	const navigate = useNavigate();

	const [inputUrl, setInputUrl] = useState(searchUrl || "");
	const [loading, setLoading] = useState(false);
	const [stepIndex, setStepIndex] = useState(-1);
	const [error, setError] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [activeTab, setActiveTab] = useState<"overview" | "features" | "shap" | "recommendations">("overview");

	const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (searchUrl && searchUrl.trim()) {
			setInputUrl(searchUrl);
			void runAnalysis(searchUrl.trim());
		}
	}, [searchUrl]);

	async function runAnalysis(url: string) {
		setError("");
		setResult(null);
		setLoading(true);
		setStepIndex(0);

		// Animate steps
		let idx = 0;
		stepTimer.current = setInterval(() => {
			idx += 1;
			if (idx < STEPS.length - 1) {
				setStepIndex(idx);
			}
		}, 800);

		try {
			const data = await citelyticsApi.analyze(url);
			clearInterval(stepTimer.current!);
			setStepIndex(STEPS.length - 1);
			await new Promise((r) => setTimeout(r, 400));
			setResult(data);
		} catch (err) {
			clearInterval(stepTimer.current!);
			setError((err as Error).message || "Analysis failed.");
		} finally {
			setLoading(false);
		}
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const url = inputUrl.trim();
		if (!url) return;
		navigate({ to: "/citelytics/analyze", search: { url } });
		void runAnalysis(url);
	}

	const tierColors: Record<string, string> = {
		low: "text-red-400",
		moderate: "text-amber-400",
		high: "text-green-400",
		very_high: "text-emerald-400",
	};

	const tierBg: Record<string, string> = {
		low: "bg-red-500/10 border-red-500/30",
		moderate: "bg-amber-500/10 border-amber-500/30",
		high: "bg-green-500/10 border-green-500/30",
		very_high: "bg-emerald-500/10 border-emerald-500/30",
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* URL input bar */}
			<form onSubmit={handleSubmit} className="mb-8">
				<div className="flex gap-3">
					<input
						id="analyze-url-input"
						type="url"
						value={inputUrl}
						onChange={(e) => setInputUrl(e.target.value)}
						placeholder="https://example.com/page"
						className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
					/>
					<button
						id="run-analysis-btn"
						type="submit"
						disabled={loading}
						className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-semibold text-sm transition-all disabled:opacity-50 shrink-0"
					>
						{loading ? "Analyzing…" : "Analyze"}
					</button>
				</div>
			</form>

			{/* Loading state */}
			{loading && (
				<div className="rounded-2xl border border-white/8 bg-white/3 p-8 mb-8">
					<h2 className="text-xl font-semibold mb-6 text-center text-white">Analyzing webpage…</h2>
					<div className="max-w-sm mx-auto flex flex-col gap-3">
						{STEPS.map((step, i) => (
							<div key={step} className="flex items-center gap-3">
								<div
									className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
										i < stepIndex
											? "bg-green-500 border-green-500 text-white"
											: i === stepIndex
												? "border-violet-400 animate-pulse"
												: "border-white/20"
									}`}
								>
									{i < stepIndex ? "✓" : i === stepIndex ? <span className="size-2 rounded-full bg-violet-400" /> : ""}
								</div>
								<span
									className={`text-sm ${
										i < stepIndex ? "text-green-400" : i === stepIndex ? "text-white" : "text-white/30"
									}`}
								>
									{step}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 mb-8 text-red-400">
					<div className="font-semibold mb-1">Analysis failed</div>
					<div className="text-sm">{error}</div>
					<div className="text-xs mt-2 text-red-400/60">
						Make sure the Python backend is running at http://localhost:8000
					</div>
				</div>
			)}

			{/* Results */}
			{result && (
				<div className="space-y-6">
					{/* Header summary */}
					<div className="rounded-2xl border border-white/8 bg-white/3 p-6">
						<div className="flex flex-col lg:flex-row gap-6 items-start">
							{/* Gauge */}
							<div className="shrink-0 flex flex-col items-center">
								<CitationGauge score={result.citation_score} tier={result.prediction_tier} />
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-start gap-3 mb-4 flex-wrap">
									<h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
									<span
										className={`text-sm font-semibold px-3 py-1 rounded-full border ${tierBg[result.prediction_tier]}`}
									>
										<span className={tierColors[result.prediction_tier]}>{result.prediction}</span>
									</span>
								</div>

								<p className="text-white/50 text-sm mb-1 break-all">
									<span className="text-white/30">URL:</span> {result.url}
								</p>
								{result.features.meta.title && (
									<p className="text-white/70 text-sm mb-4">
										<span className="text-white/30">Title:</span> {result.features.meta.title}
									</p>
								)}

								{/* Quick stats row */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
									{[
										{ label: "Word Count", value: result.features.content.word_count.toLocaleString() },
										{ label: "Factual Density", value: `${result.features.content.factual_density.toFixed(2)}` },
										{ label: "Schema Types", value: result.features.schema.schema_type_count },
										{ label: "Readiness", value: `${(result.features.local_business.local_business_readiness_score * 100).toFixed(0)}%` },
									].map((stat) => (
										<div key={stat.label} className="rounded-xl bg-white/4 border border-white/8 p-3 text-center">
											<div className="text-xl font-bold text-white">{stat.value}</div>
											<div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Tab navigation */}
					<div className="flex gap-1 border-b border-white/8 pb-0">
						{(["overview", "features", "shap", "recommendations"] as const).map((tab) => (
							<button
								key={tab}
								type="button"
								id={`tab-${tab}`}
								onClick={() => setActiveTab(tab)}
								className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
									activeTab === tab
										? "border-violet-500 text-violet-300"
										: "border-transparent text-white/40 hover:text-white/70"
								}`}
							>
								{tab === "overview" && "Overview"}
								{tab === "features" && "Feature Details"}
								{tab === "shap" && "SHAP Explanation"}
								{tab === "recommendations" && `Recommendations (${result.recommendations.length})`}
							</button>
						))}
					</div>

					{/* Tab content */}
					{activeTab === "overview" && (
						<div className="grid lg:grid-cols-2 gap-6">
							<StructuralRadar
								macro={result.features.structural.macro_structure_score}
								meso={result.features.structural.meso_structure_score}
								micro={result.features.structural.micro_structure_score}
								format={result.features.structural.format_diversity / 7}
								factual={result.features.content.factual_density / 10}
							/>
							<LocalBusinessReadiness features={result.features.local_business} schemaFeatures={result.features.schema} />
						</div>
					)}

					{activeTab === "features" && <FeatureCard features={result.features} />}

					{activeTab === "shap" && <ShapChart shapResult={result.shap_values} baseValue={result.shap_values.base_value} />}

					{activeTab === "recommendations" && <RecommendationList recommendations={result.recommendations} />}

					{/* Disclaimer */}
					<div className="text-xs text-white/20 border border-white/5 rounded-xl p-4 bg-white/2">
						{result.disclaimer}
					</div>
				</div>
			)}

			{/* Empty state */}
			{!loading && !error && !result && (
				<div className="flex flex-col items-center justify-center py-24 text-center">
					<div className="text-5xl mb-4">🔍</div>
					<h2 className="text-xl font-semibold text-white mb-2">Enter a URL to analyze</h2>
					<p className="text-white/40 text-sm max-w-md">
						Paste any publicly accessible webpage URL above. The system will extract features,
						run the citation likelihood model, and show you a SHAP explanation.
					</p>
				</div>
			)}
		</div>
	);
}
