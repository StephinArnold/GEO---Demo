/**
 * Local Business Readiness – checklist card.
 */
import type { FC } from "react";
import type { LocalBusinessFeatures, SchemaFeatures } from "@/lib/citelytics-api";

interface LocalBusinessReadinessProps {
	features: LocalBusinessFeatures;
	schemaFeatures: SchemaFeatures;
}

export const LocalBusinessReadiness: FC<LocalBusinessReadinessProps> = ({ features, schemaFeatures }) => {
	const items = [
		{ label: "Business Name (H1)", present: Boolean(features.business_name) },
		{ label: "Phone Number", present: features.has_phone === 1 },
		{ label: "Address", present: features.has_address === 1 },
		{ label: "Opening Hours", present: features.has_hours === 1 },
		{ label: "Email Contact", present: features.has_email === 1 },
		{ label: "Services Listed", present: features.has_services === 1 },
		{ label: "Ratings / Reviews", present: features.has_rating === 1 || features.has_reviews === 1 },
		{ label: "FAQ Section", present: features.has_faq === 1 },
		{ label: "Geographic Info", present: features.has_geo_info === 1 },
		{ label: "LocalBusiness Schema", present: schemaFeatures.local_business_schema === 1 },
		{ label: "FAQ Schema", present: schemaFeatures.faq_schema === 1 },
		{ label: "Organization Schema", present: schemaFeatures.organization_schema === 1 },
	];

	const present = items.filter((i) => i.present).length;
	const total = items.length;
	const pct = Math.round((present / total) * 100);

	return (
		<div className="rounded-2xl border border-white/8 bg-white/3 p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-white">Local Business Readiness</h3>
				<div className="flex items-center gap-2">
					<div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
						<div
							className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>
					<span className="text-xs font-semibold text-white/70">{pct}%</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-1.5">
				{items.map((item) => (
					<div
						key={item.label}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
							item.present ? "bg-emerald-500/8 text-emerald-400" : "bg-white/3 text-white/35"
						}`}
					>
						<span className={item.present ? "text-emerald-400" : "text-red-400/60"}>
							{item.present ? "✓" : "✗"}
						</span>
						{item.label}
					</div>
				))}
			</div>

			<p className="text-xs text-white/25 mt-3">
				{present}/{total} local business signals detected.
				{present < total && " Missing signals may reduce citation likelihood for local search queries."}
			</p>
		</div>
	);
};
