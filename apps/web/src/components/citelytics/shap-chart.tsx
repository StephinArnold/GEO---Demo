/**
 * SHAP Chart – horizontal bar chart of feature importance values.
 * Positive values = contributed toward citation likelihood.
 * Negative values = worked against citation likelihood.
 */
import type { FC } from "react";
import type { ShapResult } from "@/lib/citelytics-api";

interface ShapChartProps {
	shapResult: ShapResult;
	baseValue: number;
}

export const ShapChart: FC<ShapChartProps> = ({ shapResult, baseValue }) => {
	const { top_positive, top_negative } = shapResult;

	const allFactors = [
		...top_positive.slice(0, 6).map((f) => ({ ...f, positive: true })),
		...top_negative.slice(0, 6).map((f) => ({ ...f, positive: false })),
	].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

	const maxAbs = Math.max(...allFactors.map((f) => Math.abs(f.impact)), 0.001);

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-white/8 bg-white/3 p-6">
				<div className="flex items-start justify-between mb-1">
					<h2 className="text-lg font-semibold text-white">SHAP Feature Importance</h2>
					<span className="text-xs text-white/30 border border-white/10 rounded px-2 py-0.5">
						Base value: {(baseValue * 100).toFixed(1)}%
					</span>
				</div>
				<p className="text-xs text-white/35 mb-6">
					Each bar shows how much a feature pushed the citation likelihood prediction up (green) or down (red).
					Values are actual SHAP contributions from the XGBoost model.
				</p>

				<div className="space-y-3">
					{allFactors.map((factor) => {
						const pct = (Math.abs(factor.impact) / maxAbs) * 100;
						return (
							<div key={factor.feature} className="flex items-center gap-3">
								<div className="w-44 text-right text-xs text-white/60 shrink-0 truncate" title={factor.label}>
									{factor.label}
								</div>
								<div className="flex-1 relative h-6">
									<div className="absolute inset-y-0 left-0 right-0 rounded bg-white/3" />
									<div
										className={`absolute inset-y-1 rounded transition-all ${
											factor.positive ? "bg-emerald-500/70" : "bg-red-500/70"
										}`}
										style={{ width: `${pct}%` }}
									/>
								</div>
								<div
									className={`w-16 text-right text-xs font-mono shrink-0 ${
										factor.positive ? "text-emerald-400" : "text-red-400"
									}`}
								>
									{factor.positive ? "+" : ""}
									{factor.impact.toFixed(4)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Positive / Negative columns */}
			<div className="grid sm:grid-cols-2 gap-5">
				{/* Positive */}
				<div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5">
					<h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
						<span>↑</span> Top Positive Factors
					</h3>
					{top_positive.length === 0 && (
						<p className="text-xs text-white/30">No significant positive factors detected.</p>
					)}
					<ul className="space-y-2">
						{top_positive.slice(0, 6).map((f) => (
							<li key={f.feature} className="flex items-center justify-between text-sm">
								<span className="text-white/70">{f.label}</span>
								<span className="text-emerald-400 font-mono text-xs">+{f.impact.toFixed(4)}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Negative */}
				<div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
					<h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
						<span>↓</span> Top Negative Factors
					</h3>
					{top_negative.length === 0 && (
						<p className="text-xs text-white/30">No significant negative factors detected.</p>
					)}
					<ul className="space-y-2">
						{top_negative.slice(0, 6).map((f) => (
							<li key={f.feature} className="flex items-center justify-between text-sm">
								<span className="text-white/70">{f.label}</span>
								<span className="text-red-400 font-mono text-xs">{f.impact.toFixed(4)}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<p className="text-xs text-white/20">
				SHAP (SHapley Additive exPlanations) values are computed using TreeExplainer on the XGBoost model.
				Each value represents the exact contribution of that feature to this prediction relative to the base rate.
			</p>
		</div>
	);
};
