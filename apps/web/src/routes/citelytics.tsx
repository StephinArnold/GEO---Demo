/**
 * Citelytics layout route – wraps all /citelytics/* pages.
 * Provides shared navigation sidebar and dark AI-themed design.
 * No authentication required – this is a standalone research tool.
 */
import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/citelytics")({
	component: CitelyticsLayout,
});

const navItems = [
	{ to: "/citelytics/", label: "Home", icon: "🏠" },
	{ to: "/citelytics/analyze", label: "Analyze URL", icon: "🔍" },
	{ to: "/citelytics/history", label: "History", icon: "📋" },
	{ to: "/citelytics/about", label: "About", icon: "ℹ️" },
];

function CitelyticsLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
			{/* Top navbar */}
			<header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
				<div className="flex h-14 items-center px-4 md:px-6 gap-4">
					{/* Mobile menu button */}
					<button
						type="button"
						className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						<span className="text-lg">☰</span>
					</button>

					{/* Logo */}
					<Link to="/citelytics/" className="flex items-center gap-2.5 shrink-0">
						<div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold">C</div>
						<span className="font-bold text-base tracking-tight">
							<span className="text-white">Cite</span>
							<span className="text-violet-400">lytics</span>
						</span>
						<span className="hidden sm:inline text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5 ml-1">
							Research Prototype
						</span>
					</Link>

					{/* Desktop nav */}
					<nav className="hidden md:flex items-center gap-1 ml-6">
						{navItems.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all"
								activeProps={{ className: "px-3 py-1.5 rounded-lg text-sm text-violet-300 bg-violet-500/10 font-medium" }}
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="ml-auto flex items-center gap-2">
						<span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
							<span>⚠</span> Demo model
						</span>
					</div>
				</div>
			</header>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/60 md:hidden"
					onClick={() => setSidebarOpen(false)}
					onKeyDown={() => setSidebarOpen(false)}
				>
					<div
						className="absolute left-0 top-0 bottom-0 w-64 bg-[#12121a] border-r border-white/8 pt-16 p-4"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<nav className="flex flex-col gap-1">
							{navItems.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									onClick={() => setSidebarOpen(false)}
									className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition"
									activeProps={{ className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-violet-300 bg-violet-500/10 font-medium" }}
								>
									<span>{item.icon}</span>
									{item.label}
								</Link>
							))}
						</nav>
					</div>
				</div>
			)}

			{/* Page content */}
			<main className="pt-14">
				<Outlet />
			</main>
		</div>
	);
}
