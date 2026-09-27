/**
 * Recommendation List – prioritized actionable suggestions.
 */
import type { FC } from "react";
import type { Recommendation } from "@/lib/citelytics-api";

interface RecommendationListProps {
	recommendations: Recommendation[];
}

const priorityConfig = {
	high: {
		label: "High Impact",
		badge: "bg-red-500/15 text-red-400 border-red-500/20",
		border: "border-red-500/20",
		icon: "🔴",
	},
	medium: {
		label: "Medium Impact",
		badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
		border: "border-amber-500/20",
		icon: "🟡",
	},
	low: {
		label: "Low Impact",
		badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",
		border: "border-white/8",
		icon: "🔵",
	},
};

const categoryColors: Record<string, string> = {
	Schema: "text-violet-400",
	Content: "text-cyan-400",
	Structure: "text-indigo-400",
	Readability: "text-teal-400",
	"Local Business": "text-amber-400",
};

export const RecommendationList: FC<RecommendationListProps> = ({ recommendations }) => {
	if (recommendations.length === 0) {
		return (
			<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
				<div className="text-3xl mb-3">🎉</div>
				<h3 className="text-base font-semibold text-emerald-400 mb-1">No major issues detected</h3>
				<p className="text-sm text-white/40">
					The model did not trigger any recommendation rules for this page.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-xs text-white/30">
				Recommendations are generated from actual detected features — not generic advice.
				Implement these to potentially improve citation likelihood in future analyses.
			</p>
			{recommendations.map((rec) => {
				const cfg = priorityConfig[rec.priority];
				return (
					<div
						key={rec.id}
						className={`rounded-2xl border ${cfg.border} bg-white/3 p-5 hover:bg-white/5 transition`}
					>
						<div className="flex items-start gap-4">
							<div className="text-xl shrink-0 mt-0.5">{cfg.icon}</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start gap-2 flex-wrap mb-1">
									<h3 className="text-sm font-semibold text-white">{rec.title}</h3>
									<span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
										{cfg.label}
									</span>
									<span className={`text-xs font-medium ${categoryColors[rec.category] || "text-white/50"}`}>
										{rec.category}
									</span>
								</div>
								<p className="text-sm text-white/50 leading-relaxed">{rec.description}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
