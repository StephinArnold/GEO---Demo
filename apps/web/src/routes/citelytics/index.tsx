/**
 * Citelytics – Home / Landing page
 * Route: /citelytics/
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/citelytics/")({
	component: CitelyticsHome,
});

function CitelyticsHome() {
	const navigate = useNavigate();
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = url.trim();
		if (!trimmed) {
			setError("Please enter a URL.");
			return;
		}
		if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
			setError("URL must start with http:// or https://");
			return;
		}
		setError("");
		navigate({ to: "/citelytics/analyze", search: { url: trimmed } });
	}

	const benefits = [
		{
			icon: "🎯",
			title: "Citation Prediction",
			desc: "XGBoost model estimates how likely a page is to be cited by AI answer engines like ChatGPT and Perplexity.",
		},
		{
			icon: "🧠",
			title: "Explainable AI",
			desc: "SHAP values reveal exactly which content and structural features drove the prediction — no black box.",
		},
		{
			icon: "📊",
			title: "GEO Insights",
			desc: "Generative Engine Optimization signals: schema, factual density, structure, and local business readiness.",
		},
	];

	const researchGaps = [
		{ label: "Traditional SEO", desc: "Optimizes search ranking", icon: "📈" },
		{ label: "Checklist GEO", desc: "Heuristic recommendations", icon: "✅" },
		{ label: "Structural GEO", desc: "Section-level optimization", icon: "🏗️" },
		{ label: "E-commerce GEO", desc: "Product ranking focus", icon: "🛒" },
		{ label: "Our System", desc: "Per-page explainable citation prediction", icon: "✨", highlight: true },
	];

	return (
		<div className="min-h-[calc(100vh-3.5rem)]">
			{/* Hero section */}
			<section className="relative flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
				{/* Background glow */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
					<div className="absolute top-1/3 left-1/3 size-[400px] bg-cyan-600/8 rounded-full blur-[100px]" />
				</div>

				{/* Badge */}
				<div className="mb-6 inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 text-sm text-violet-300">
					<span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
					College Research Project · XGBoost + SHAP
				</div>

				<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
					Can AI Answer Engines{" "}
					<span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
						Cite Your Webpage?
					</span>
				</h1>

				<p className="text-lg text-white/50 max-w-2xl mb-4">
					Analyze your webpage's content and structural signals to estimate citation likelihood in
					generative answer engines. Powered by an explainable XGBoost model.
				</p>

				<p className="text-sm text-amber-400/70 mb-10 border border-amber-400/20 bg-amber-400/5 rounded-lg px-4 py-2 max-w-xl">
					⚠️ Prediction is an estimate based on the trained demo model and extracted webpage features.
					This system does not guarantee citation by any AI engine.
				</p>

				{/* URL input */}
				<form onSubmit={handleSubmit} className="w-full max-w-2xl">
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="flex-1 relative">
							<input
								id="url-input"
								type="url"
								value={url}
								onChange={(e) => { setUrl(e.target.value); setError(""); }}
								placeholder="https://example.com/local-business-page"
								className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition text-sm"
							/>
						</div>
						<button
							id="analyze-btn"
							type="submit"
							className="h-12 px-7 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 shrink-0"
						>
							Analyze Page →
						</button>
					</div>
					{error && <p className="mt-2 text-sm text-red-400 text-left">{error}</p>}
				</form>

				{/* Example URLs */}
				<div className="mt-4 flex flex-wrap justify-center gap-2">
					{[
						"https://en.wikipedia.org/wiki/Artificial_intelligence",
						"https://www.bbc.com/news",
					].map((example) => (
						<button
							key={example}
							type="button"
							onClick={() => setUrl(example)}
							className="text-xs text-white/30 hover:text-violet-400 transition underline underline-offset-2"
						>
							{example}
						</button>
					))}
				</div>
			</section>

			{/* Benefits */}
			<section className="px-4 pb-20">
				<div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-5">
					{benefits.map((b) => (
						<div key={b.title} className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-violet-500/30 hover:bg-white/5 transition-all group">
							<div className="text-3xl mb-3">{b.icon}</div>
							<h3 className="font-semibold text-white mb-2">{b.title}</h3>
							<p className="text-sm text-white/50 leading-relaxed">{b.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* Research gap */}
			<section className="px-4 pb-24">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<h2 className="text-2xl font-bold text-white mb-2">Research Contribution</h2>
						<p className="text-white/40 text-sm">Where Citelytics fits in the GEO research landscape</p>
					</div>
					<div className="grid sm:grid-cols-5 gap-3">
						{researchGaps.map((rg) => (
							<div
								key={rg.label}
								className={`rounded-xl p-4 border text-center transition-all ${
									rg.highlight
										? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-900/20"
										: "border-white/8 bg-white/3"
								}`}
							>
								<div className="text-2xl mb-2">{rg.icon}</div>
								<div className={`font-semibold text-sm mb-1 ${rg.highlight ? "text-violet-300" : "text-white/80"}`}>
									{rg.label}
								</div>
								<div className="text-xs text-white/40">{rg.desc}</div>
							</div>
						))}
					</div>
					<p className="text-center text-xs text-white/30 mt-6">
						A single explainable, feature-driven model that predicts per-page citation likelihood — our central research contribution.
					</p>
				</div>
			</section>

			{/* Pipeline */}
			<section className="px-4 pb-24">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-2xl font-bold text-white text-center mb-10">Analysis Pipeline</h2>
					<div className="flex flex-wrap justify-center gap-3 items-center">
						{[
							"URL Input",
							"Webpage Scraping",
							"Feature Extraction",
							"XGBoost Classifier",
							"SHAP Explanation",
							"Recommendations",
						].map((step, i, arr) => (
							<div key={step} className="flex items-center gap-3">
								<div className="rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-white/70 font-medium">
									{step}
								</div>
								{i < arr.length - 1 && <span className="text-white/20 text-lg">→</span>}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer disclaimer */}
			<footer className="border-t border-white/5 px-4 py-8 text-center">
				<p className="text-xs text-white/20 max-w-2xl mx-auto">
					Citelytics is a college research prototype. The system estimates citation likelihood based on learned
					relationships between webpage features and synthetic citation labels. It does not represent the
					actual behavior of any AI system. Predictions should not be presented as correlation with or
					causation of real AI citations.
				</p>
				<p className="mt-2 text-xs text-white/15">
					Citation Likelihood Prediction in Generative Answer Engines · Explainable ML Approach
				</p>
			</footer>
		</div>
	);
}
