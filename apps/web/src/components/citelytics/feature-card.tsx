/**
 * Feature Card – displays all extracted features in categorized sections.
 */
import type { FC } from "react";
import type { AnalysisResult } from "@/lib/citelytics-api";

interface FeatureCardProps {
	features: AnalysisResult["features"];
}

function Row({ label, value }: { label: string; value: string | number | boolean }) {
	const display = typeof value === "boolean" ? (value ? "✓ Yes" : "✗ No") : String(value);
	const isPositive = display === "✓ Yes";
	const isNegative = display === "✗ No";

	return (
		<div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
			<span className="text-sm text-white/50">{label}</span>
			<span
				className={`text-sm font-medium ${
					isPositive ? "text-emerald-400" : isNegative ? "text-red-400/70" : "text-white/80"
				}`}
			>
				{display}
			</span>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-2xl border border-white/8 bg-white/3 p-5">
			<h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wide mb-3">{title}</h3>
			{children}
		</div>
	);
}

export const FeatureCard: FC<FeatureCardProps> = ({ features }) => {
	const { content, structural, schema, local_business, meta } = features;

	return (
		<div className="grid sm:grid-cols-2 gap-5">
			{/* Meta */}
			<Section title="Page Meta">
				<Row label="Title" value={meta.title || "(none)"} />
				<Row label="Meta Description" value={meta.meta_description ? "✓ Present" : "✗ Missing"} />
			</Section>

			{/* Content */}
			<Section title="Content Features">
				<Row label="Word Count" value={content.word_count.toLocaleString()} />
				<Row label="Sentence Count" value={content.sentence_count} />
				<Row label="Avg. Sentence Length (words)" value={content.avg_sentence_length.toFixed(1)} />
				<Row label="Paragraph Count" value={content.paragraph_count} />
				<Row label="Avg. Paragraph Length (words)" value={content.avg_paragraph_length.toFixed(1)} />
				<Row label="Factual Density (est.)" value={content.factual_density.toFixed(4)} />
				<Row label="Numeric Statements" value={content.numeric_statements} />
				<Row label="Quotations" value={content.quotation_count} />
				<Row label="In-text Citations" value={content.citation_count} />
				<Row label="External Links" value={content.external_link_count} />
				<Row label="Internal Links" value={content.internal_link_count} />
			</Section>

			{/* Media & Format */}
			<Section title="Media & Formatting">
				<Row label="Images" value={content.image_count} />
				<Row label="Lists (ul/ol)" value={content.list_count} />
				<Row label="Tables" value={content.table_count} />
				<Row label="Emphasis Elements" value={content.emphasis_count} />
				<Row label="Emphasis Density" value={content.emphasis_density.toFixed(4)} />
			</Section>

			{/* Structural */}
			<Section title="Structural Features">
				<Row label="H1 Tags" value={structural.h1_count} />
				<Row label="H2 Tags" value={structural.h2_count} />
				<Row label="H3 Tags" value={structural.h3_count} />
				<Row label="Total Headings" value={structural.heading_count} />
				<Row label="Heading Depth" value={structural.heading_depth} />
				<Row label="Hierarchy Consistent" value={structural.hierarchy_consistent === 1} />
				<Row label="Hierarchy Violations" value={structural.hierarchy_violations} />
				<Row label="Section Count" value={structural.section_count} />
				<Row label="Avg. Paragraphs / Section" value={structural.avg_paras_per_section.toFixed(1)} />
				<Row label="Format Diversity (0–7)" value={structural.format_diversity} />
			</Section>

			{/* Structural scores */}
			<Section title="Structural Scores">
				<Row label="Macro Structure (0–1)" value={structural.macro_structure_score.toFixed(4)} />
				<Row label="Meso Structure (0–1)" value={structural.meso_structure_score.toFixed(4)} />
				<Row label="Micro Structure (0–1)" value={structural.micro_structure_score.toFixed(4)} />
			</Section>

			{/* Schema */}
			<Section title="Schema / Structured Data">
				<Row label="Schema Present" value={schema.schema_present === 1} />
				<Row label="Schema Type Count" value={schema.schema_type_count} />
				<Row label="Schema Types" value={schema.schema_types.join(", ") || "(none)"} />
				<Row label="LocalBusiness Schema" value={schema.local_business_schema === 1} />
				<Row label="FAQ Schema" value={schema.faq_schema === 1} />
				<Row label="Organization Schema" value={schema.organization_schema === 1} />
				<Row label="Article Schema" value={schema.article_schema === 1} />
				<Row label="Product Schema" value={schema.product_schema === 1} />
				<Row label="Breadcrumb Schema" value={schema.breadcrumb_schema === 1} />
			</Section>

			{/* Local business */}
			<Section title="Local Business Signals">
				<Row label="Business Name (H1)" value={local_business.business_name || "(not detected)"} />
				<Row label="Phone Number" value={local_business.has_phone === 1} />
				<Row label="Address" value={local_business.has_address === 1} />
				<Row label="Opening Hours" value={local_business.has_hours === 1} />
				<Row label="Rating" value={local_business.has_rating === 1} />
				<Row label="Reviews / Testimonials" value={local_business.has_reviews === 1} />
				<Row label="Services Listed" value={local_business.has_services === 1} />
				<Row label="Email Contact" value={local_business.has_email === 1} />
				<Row label="FAQ Section" value={local_business.has_faq === 1} />
				<Row label="Geographic Information" value={local_business.has_geo_info === 1} />
				<Row
					label="Readiness Score"
					value={`${(local_business.local_business_readiness_score * 100).toFixed(0)}% (${Math.round(local_business.local_business_readiness_score * 8)}/8 signals)`}
				/>
			</Section>
		</div>
	);
};
