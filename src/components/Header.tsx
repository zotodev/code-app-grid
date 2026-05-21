import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock, RotateCw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function formatLocationAddress(location: {
	pathname: string;
	search: Record<string, unknown>;
	hash: string;
}): string {
	const params = Object.entries(location.search)
		.filter(([, value]) => value !== undefined && value !== null)
		.map(([key, value]) => {
			const serialized =
				typeof value === "string" ? value : JSON.stringify(value);
			return `${key}=${serialized}`;
		});

	const search = params.length > 0 ? `?${params.join("&")}` : "";
	return `${location.pathname}${search}${location.hash ?? ""}`;
}

function toRouterHref(prettyPath: string): string {
	const hashIndex = prettyPath.indexOf("#");
	const hash = hashIndex >= 0 ? prettyPath.slice(hashIndex) : "";
	const pathAndSearch =
		hashIndex >= 0 ? prettyPath.slice(0, hashIndex) : prettyPath;

	const queryIndex = pathAndSearch.indexOf("?");
	const pathname =
		queryIndex >= 0 ? pathAndSearch.slice(0, queryIndex) : pathAndSearch;
	const queryString =
		queryIndex >= 0 ? pathAndSearch.slice(queryIndex + 1) : "";

	if (!queryString) {
		return `${pathname}${hash}`;
	}

	return `${pathname}?${new URLSearchParams(queryString).toString()}${hash}`;
}

export function Header() {
	const location = useLocation();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [addressInput, setAddressInput] = React.useState(() =>
		formatLocationAddress(location),
	);
	const [isPending, setIsPending] = React.useState(false);

	// Sync address bar with pathname, search params, and hash
	React.useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setAddressInput(formatLocationAddress(location));
	}, [location.hash, location.pathname, location.searchStr]);

	const handleNavigate = (path: string) => {
		let cleanPath = path.trim();
		if (!cleanPath) return;

		// Normalize cleanPath to start with a slash
		if (!cleanPath.startsWith("/")) {
			cleanPath = "/" + cleanPath;
		}

		try {
			router.history.push(toRouterHref(cleanPath));
		} catch (err) {
			console.error("Navigation error:", err);
		}
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleNavigate(addressInput);
		}
	};

	const triggerReload = async () => {
		setIsPending(true);
		try {
			await queryClient.invalidateQueries();
			window.location.reload();
		} catch (err) {
			setIsPending(false);
			toast.error("Failed to reload page", {
				description:
					err instanceof Error ? err.message : "Could not invalidate cached data.",
			});
		}
	};

	return (
		<header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/65 px-4 py-2 gap-3 h-14 select-none">
			{/* Left: Standard Navigation controls */}
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full"
					onClick={() => window.history.back()}
					title="Go back"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full"
					onClick={() => window.history.forward()}
					title="Go forward"
				>
					<ArrowRight className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full"
					onClick={triggerReload}
					title="Reload this page"
				>
					<RotateCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
				</Button>
			</div>

			{/* Center: Address Bar (Omnibox) */}
			<div className="flex flex-1 items-center bg-muted/40 hover:bg-muted/70 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring border px-3 py-1 gap-2 transition-all h-9">
				<Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
				<div className="flex items-center text-xs text-muted-foreground select-none shrink-0 font-mono">
					https://localhost:5173
				</div>
				<input
					type="text"
					className="flex-1 bg-transparent border-none outline-none font-mono text-sm h-full w-full py-0 text-foreground"
					value={addressInput}
					onChange={(e) => setAddressInput(e.target.value)}
					onKeyDown={onKeyPress}
					placeholder="Type a path to navigate..."
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleNavigate(addressInput)}
					className="h-6 px-3 text-[11px] shrink-0 font-medium hover:bg-primary hover:text-primary-foreground border-muted-foreground/30"
				>
					Go
				</Button>
			</div>

			{/* Right: Theme Switcher */}
			<div className="flex items-center gap-2">
				<ThemeToggle />
			</div>
		</header>
	);
}
