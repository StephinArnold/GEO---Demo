/**
 * Structural Radar – spider/radar chart showing macro/meso/micro scores.
 * Uses pure SVG to avoid adding another charting dependency.
 */
import type { FC } from "react";

interface StructuralRadarProps {
	macro: number;   // 0–1
	meso: number;    // 0–1
	micro: number;   // 0–1
	format: number;  // 0–1
	factual: number; // 0–1
}

const AXES = ["Macro Structure", "Meso Structure", "Micro Structure", "Format Diversity", "Factual Density"];

function polarToXY(cx: number, cy: number, r: number, angleOffset: number, index: number, total: number) {
	const angle = (2 * Math.PI * index) / total + angleOffset;
	return {
		x: cx + r * Math.sin(angle),
		y: cy - r * Math.cos(angle),
	};
}

export const StructuralRadar: FC<StructuralRadarProps> = ({ macro, meso, micro, format, factual }) => {
	const values = [macro, meso, micro, format, factual];
	const cx = 160;
	const cy = 140;
	const maxR = 100;
	const angleOffset = 0;
	const total = 5;

	// Grid rings
	const gridLevels = [0.25, 0.5, 0.75, 1.0];

	// Axis endpoints
	const axisPoints = Array.from({ length: total }, (_, i) => polarToXY(cx, cy, maxR, angleOffset, i, total));

	// Data polygon
	const dataPoints = values.map((v, i) => polarToXY(cx, cy, maxR * Math.max(v, 0.02), angleOffset, i, total));

	const toPath = (pts: { x: number; y: number }[]) =>
		pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

	return (
		<div className="rounded-2xl border border-white/8 bg-white/3 p-5">
			<h3 className="text-sm font-semibold text-white mb-4">Structural Analysis</h3>
			<div className="flex flex-col sm:flex-row items-center gap-4">
				<svg width="320" height="280" viewBox="0 0 320 280">
					{/* Grid rings */}
					{gridLevels.map((level) => {
						const pts = Array.from({ length: total }, (_, i) =>
							polarToXY(cx, cy, maxR * level, angleOffset, i, total),
						);
						return (
							<path
								key={level}
								d={toPath(pts)}
								fill="none"
								stroke="rgba(255,255,255,0.06)"
								strokeWidth="1"
							/>
						);
					})}

					{/* Axis lines */}
					{axisPoints.map((pt, i) => (
						<line
							key={AXES[i]}
							x1={cx}
							y1={cy}
							x2={pt.x}
							y2={pt.y}
							stroke="rgba(255,255,255,0.08)"
							strokeWidth="1"
						/>
					))}

					{/* Data polygon */}
					<path
						d={toPath(dataPoints)}
						fill="rgba(139,92,246,0.2)"
						stroke="rgba(139,92,246,0.8)"
						strokeWidth="2"
					/>

					{/* Data points */}
					{dataPoints.map((pt, i) => (
						<circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#8b5cf6" />
					))}

					{/* Labels */}
					{axisPoints.map((pt, i) => {
						const angle = (2 * Math.PI * i) / total + angleOffset;
						const lx = cx + (maxR + 22) * Math.sin(angle);
						const ly = cy - (maxR + 22) * Math.cos(angle);
						return (
							<text
								key={`lbl-${i}`}
								x={lx}
								y={ly}
								textAnchor="middle"
								dominantBaseline="middle"
								fontSize="9"
								fill="rgba(255,255,255,0.4)"
							>
								{AXES[i]}
							</text>
						);
					})}
				</svg>

				{/* Legend */}
				<div className="space-y-2 min-w-[140px]">
					{AXES.map((axis, i) => (
						<div key={axis} className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-violet-500 shrink-0" />
							<div>
								<div className="text-xs text-white/50">{axis}</div>
								<div className="text-xs font-semibold text-white/80">
									{(values[i] * 100).toFixed(0)}%
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
