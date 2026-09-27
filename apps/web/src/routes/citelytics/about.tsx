/**
 * Citelytics – About page
 * Route: /citelytics/about
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/citelytics/about")({
	component: AboutPage,
});

function AboutPage() {
	const techStack = [
		{ category: "Frontend", items: ["React 19", "TanStack Router", "TanStack Query", "Recharts", "Tailwind CSS v4"] },
		{ category: "Backend", items: ["Python 3.12", "FastAPI", "Uvicorn", "Pydantic v2"] },
		{ category: "Web Scraping", items: ["requests", "BeautifulSoup4", "lxml"] },
		{ category: "Machine Learning", items: ["XGBoost", "scikit-learn", "SHAP", "pandas", "numpy"] },
		{ category: "Storage", items: ["SQLite (history)", "joblib (model serialization)"] },
		{ category: "Security", items: ["SSRF guard", "URL scheme validation", "Response size limiting", "Timeout control"] },
	];

	const limitations = [
		"Demo model trained on synthetic data — not real AI citation data.",
		"JavaScript-heavy pages may be partially parsed (no headless browser).",
		"Factual density is estimated via heuristics, not NLP.",
		"No real-time AI engine integration (would require paid API access).",
		"Local business feature detection uses regex, not entity recognition.",
	];

	const futureWork = [
		"Collect real citation labels from generative AI engines via API.",
		"Retrain XGBoost on real-world data.",
		"Add headless browser support (Playwright) for JS-rendered pages.",
		"NLP-based named entity recognition for factual density.",
		"Multi-page website-level analysis.",
		"Competitor comparison dashboard.",
		"Export PDF reports.",
	];

	return (
		<div className="max-w-4xl mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-3xl font-bold text-white mb-2">About Citelytics</h1>
				<p className="text-white/50 text-sm">
					AI Citation Intelligence — a college research project on Generative Engine Optimization.
				</p>
			</div>

			{/* Project overview */}
			<section className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6">
				<h2 className="text-lg font-semibold text-white mb-3">Project Title</h2>
				<p className="text-violet-300 font-medium mb-3">
					Citation Likelihood Prediction in Generative Answer Engines
				</p>
				<p className="text-white/50 text-sm leading-relaxed mb-3">
					<span className="font-semibold text-white/70">Explainable ML Approach for Local Business Content</span>
				</p>
				<p className="text-white/50 text-sm leading-relaxed">
					Traditional SEO tools predict search-engine ranking, but modern AI answer engines (ChatGPT,
					Perplexity-style systems) directly answer user queries and cite only a small number of source
					webpages. This project aims to predict: "How likely is a webpage to be cited by a generative
					AI answer engine?" using an explainable XGBoost + SHAP pipeline.
				</p>
			</section>

			{/* Research gap */}
			<section className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6">
				<h2 className="text-lg font-semibold text-white mb-4">Research Gap</h2>
				<div className="space-y-3 text-sm">
					{[
						["Traditional SEO", "Optimises search ranking — does not model AI citation behaviour."],
						["Checklist-based GEO", "Provides heuristic recommendations without ML prediction."],
						["Structural GEO", "Studies structural optimization, not per-page citation likelihood."],
						["E-commerce GEO", "Focuses on product ranking in AI engines."],
						["AI-search bias studies", "Describe sourcing patterns, don't provide a predictive model."],
						["Citelytics", "A single explainable, feature-driven model predicting per-page citation likelihood — the central contribution."],
					].map(([name, desc]) => (
						<div key={name} className="flex gap-3">
							<div className="shrink-0 w-36 text-white/60 font-medium">{name}</div>
							<div className="text-white/40">{desc}</div>
						</div>
					))}
				</div>
			</section>

			{/* Tech stack */}
			<section className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6">
				<h2 className="text-lg font-semibold text-white mb-4">Technology Stack</h2>
				<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
					{techStack.map((tc) => (
						<div key={tc.category}>
							<div className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2">{tc.category}</div>
							<ul className="space-y-1">
								{tc.items.map((item) => (
									<li key={item} className="text-sm text-white/50 flex items-start gap-1.5">
										<span className="text-white/20 mt-0.5">·</span>
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			{/* Pipeline */}
			<section className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6">
				<h2 className="text-lg font-semibold text-white mb-4">Analysis Pipeline</h2>
				<div className="font-mono text-sm text-white/50 bg-white/3 rounded-xl p-4 leading-loose">
					<div>Webpage URL</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Webpage Scraping (requests + BeautifulSoup)</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Content + Structural Feature Extraction (44 features)</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Feature Processing (pandas DataFrame)</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>XGBoost Citation Classifier</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Citation Likelihood Score (0–100)</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>SHAP Explainability (TreeExplainer)</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Top Positive / Negative Factors</div>
					<div className="pl-4 text-white/25">↓</div>
					<div>Recommendations + Report</div>
				</div>
			</section>

			{/* Academic disclaimer */}
			<section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-6">
				<h2 className="text-base font-semibold text-amber-400 mb-3">⚠️ Academic Disclaimer</h2>
				<div className="text-sm text-white/50 space-y-2">
					<p>
						The demo model is trained on <strong className="text-white/70">synthetic data</strong> for
						development/testing purposes. It is not based on real observed citation labels from any AI engine.
					</p>
					<p>
						Citelytics estimates citation likelihood based on <em>learned relationships</em> between webpage
						features and synthetic labels. It does not guarantee or predict the actual behaviour of ChatGPT,
						Perplexity, or any other AI system.
					</p>
					<p>
						Correlation between features and citation is not established as causation.
						Model predictions should be interpreted as <em>experimental estimates</em>.
					</p>
				</div>
			</section>

			{/* Limitations & future work */}
			<div className="grid sm:grid-cols-2 gap-5 mb-6">
				<section className="rounded-2xl border border-white/8 bg-white/3 p-6">
					<h2 className="text-base font-semibold text-white mb-3">Current Limitations</h2>
					<ul className="space-y-2">
						{limitations.map((l) => (
							<li key={l} className="text-sm text-white/50 flex gap-2">
								<span className="text-red-400 shrink-0">–</span>
								{l}
							</li>
						))}
					</ul>
				</section>
				<section className="rounded-2xl border border-white/8 bg-white/3 p-6">
					<h2 className="text-base font-semibold text-white mb-3">Future Work</h2>
					<ul className="space-y-2">
						{futureWork.map((fw) => (
							<li key={fw} className="text-sm text-white/50 flex gap-2">
								<span className="text-violet-400 shrink-0">→</span>
								{fw}
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
