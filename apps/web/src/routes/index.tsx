/**
 * Home page - / route
 *
 * Redirects to /citelytics/ — the Citelytics landing page — for all visitors.
 * Authenticated users are redirected to /app instead.
 *
 * ⚠️ College Project: Citelytics is the primary product at this URL.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth/session";

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	beforeLoad: async () => {
		const session = await getSession();

		if (session) {
			// Authenticated users go to their dashboard
			throw redirect({ to: "/app" });
		}

		// Everyone else → Citelytics landing page
		throw redirect({ to: "/citelytics/" });
	},
});
