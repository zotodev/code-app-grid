import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Link,
	Outlet,
	useLocation,
	useRouter,
} from "@tanstack/react-router";

import { Header } from "@/components/Header";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootLayout,
	notFoundComponent: NotFound,
	errorComponent: GlobalError,
});

function RootLayout() {
	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
			{/* Sticky Chrome-style browser header */}
			<Header />

			{/* Main viewport */}
			<main className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col">
				<Outlet />

			</main>
		</div>
	);
}

function NotFound() {
	const { pathname } = useLocation();
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
			<h1 className="text-6xl font-bold">404</h1>
			<p className="font-mono text-sm text-muted-foreground">{pathname}</p>
			<p className="text-muted-foreground text-lg">Page not found</p>
			<Link to="/" className="text-sm underline underline-offset-4">
				Go home
			</Link>
		</div>
	);
}

function GlobalError({ error }: { error: Error }) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
			<h2 className="text-2xl font-bold">Something went wrong</h2>
			<p className="text-muted-foreground text-sm max-w-sm">{error.message}</p>
			<button
				type="button"
				className="text-sm underline underline-offset-4"
				onClick={() => router.invalidate()}
			>
				Try again
			</button>
		</div>
	);
}


