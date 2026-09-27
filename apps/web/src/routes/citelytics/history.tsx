/**
 * Citelytics – History page
 * Route: /citelytics/history
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { citelyticsApi, type HistoryItem } from "@/lib/citelytics-api";

export const Route = createFileRoute("/citelytics/history")({
	component: HistoryPage,
});

function HistoryPage() {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		citelyticsApi
			.history()
			.then((data) => setHistory(data.analyses))
			.catch((err) => setError((err as Error).message))
			.finally(() => setLoading(false));
	}, []);

	const tierBadge = (score: number) => {
		if (score <= 30) return "bg-red-500/10 text-red-400 border-red-500/20";
		if (score <= 60) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
		if (score <= 80) return "bg-green-500/10 text-green-400 border-green-500/20";
		return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
	};

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-white mb-1">Analysis History</h1>
				<p className="text-white/40 text-sm">Previous URL analyses — click any row to view the full report.</p>
			</div>

			{loading && (
				<div className="flex items-center justify-center py-20 text-white/40">
					<span className="animate-spin mr-3">⟳</span> Loading…
				</div>
			)}

			{error && (
				<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400 text-sm">
					{error}
					<div className="text-red-400/50 mt-1 text-xs">Is the Python backend running?</div>
				</div>
			)}

			{!loading && !error && history.length === 0 && (
				<div className="text-center py-20">
					<div className="text-4xl mb-4">📋</div>
					<h2 className="text-lg font-semibold text-white mb-2">No analyses yet</h2>
					<p className="text-white/40 text-sm mb-6">Run your first analysis to see it here.</p>
					<Link
						to="/citelytics/analyze"
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition"
					>
						Analyze a URL →
					</Link>
				</div>
			)}

			{!loading && history.length > 0 && (
				<div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wide">
								<th className="px-4 py-3 text-left">URL</th>
								<th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
								<th className="px-4 py-3 text-center">Score</th>
								<th className="px-4 py-3 text-left hidden md:table-cell">Prediction</th>
								<th className="px-4 py-3" />
							</tr>
						</thead>
						<tbody>
							{history.map((item) => (
								<tr key={item.id} className="border-b border-white/5 hover:bg-white/3 transition">
									<td className="px-4 py-3 max-w-[200px]">
										<div className="truncate text-white/70">{item.url}</div>
									</td>
									<td className="px-4 py-3 text-white/40 hidden sm:table-cell whitespace-nowrap">
										{new Date(item.created_at).toLocaleDateString()}
									</td>
									<td className="px-4 py-3 text-center">
										<span
											className={`inline-flex items-center justify-center size-9 rounded-full text-sm font-bold border ${tierBadge(item.citation_score)}`}
										>
											{item.citation_score}
										</span>
									</td>
									<td className="px-4 py-3 text-white/60 hidden md:table-cell text-xs">{item.prediction}</td>
									<td className="px-4 py-3 text-right">
										<Link
											to="/citelytics/analyze"
											search={{ url: item.url }}
											className="text-xs text-violet-400 hover:text-violet-300 transition"
										>
											Re-analyze →
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
