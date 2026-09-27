/**
 * Citation Gauge – radial/arc visual for the score (0–100).
 */
import type { FC } from "react";

interface CitationGaugeProps {
	score: number;
	tier: "low" | "moderate" | "high" | "very_high";
}

const tierConfig = {
	low: { color: "#ef4444", label: "Low estimated likelihood", gradFrom: "#ef4444", gradTo: "#f97316" },
	moderate: { color: "#f59e0b", label: "Moderate estimated likelihood", gradFrom: "#f59e0b", gradTo: "#eab308" },
	high: { color: "#22c55e", label: "High estimated likelihood", gradFrom: "#22c55e", gradTo: "#10b981" },
	very_high: { color: "#10b981", label: "Very high estimated likelihood", gradFrom: "#10b981", gradTo: "#06b6d4" },
};

export const CitationGauge: FC<CitationGaugeProps> = ({ score, tier }) => {
	const cfg = tierConfig[tier];

	// Arc calculation
	const radius = 70;
	const cx = 100;
	const cy = 100;
	const startAngle = -210; // degrees
	const endAngle = 30;
	const totalArc = endAngle - startAngle; // 240 degrees
	const scoreArc = (score / 100) * totalArc;
	const currentAngle = startAngle + scoreArc;

	function polar(cx: number, cy: number, r: number, angleDeg: number) {
		const rad = ((angleDeg - 90) * Math.PI) / 180;
		return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
	}

	function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
		const s = polar(cx, cy, r, startDeg);
		const e = polar(cx, cy, r, endDeg);
		const largeArc = endDeg - startDeg > 180 ? 1 : 0;
		return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
	}

	return (
		<div className="flex flex-col items-center">
			<svg width="200" height="160" viewBox="0 0 200 160">
				<defs>
					<linearGradient id={`gauge-grad-${score}`} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor={cfg.gradFrom} />
						<stop offset="100%" stopColor={cfg.gradTo} />
					</linearGradient>
				</defs>

				{/* Track */}
				<path
					d={arcPath(cx, cy, radius, startAngle, endAngle)}
					fill="none"
					stroke="rgba(255,255,255,0.06)"
					strokeWidth="12"
					strokeLinecap="round"
				/>

				{/* Value arc */}
				{score > 0 && (
					<path
						d={arcPath(cx, cy, radius, startAngle, currentAngle)}
						fill="none"
						stroke={`url(#gauge-grad-${score})`}
						strokeWidth="12"
						strokeLinecap="round"
					/>
				)}

				{/* Score text */}
				<text x={cx} y={cy + 8} textAnchor="middle" fontSize="32" fontWeight="700" fill="white">
					{score}
				</text>
				<text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
					/ 100
				</text>
			</svg>

			<div className="text-center -mt-2">
				<div className="text-xs font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>
					Citation Likelihood
				</div>
				<div className="text-xs text-white/35 mt-0.5">{cfg.label}</div>
			</div>
		</div>
	);
};
