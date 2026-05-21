import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock, RotateCw } from "lucide-react";
import * as React from "react";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
	const location = useLocation();
	const navigate = useNavigate();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [addressInput, setAddressInput] = React.useState(location.pathname);
	const [isPending, setIsPending] = React.useState(false);

	// Sync address bar input with the active location path
	React.useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setAddressInput(location.pathname);
	}, [location.pathname]);

	const handleNavigate = (path: string) => {
		let cleanPath = path.trim();
		if (!cleanPath) return;

		// Normalize cleanPath to start with a slash
		if (!cleanPath.startsWith("/")) {
			cleanPath = "/" + cleanPath;
		}

		navigate({ to: cleanPath }).catch((err) => {
			console.error("Navigation error:", err);
		});
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleNavigate(addressInput);
		}
	};

	const triggerReload = () => {
		setIsPending(true);
		queryClient.invalidateQueries().catch((err) => {
			console.error("Error invalidating queries:", err);
		});
		router.invalidate();
		// Simulate loading animation finish
		setTimeout(() => setIsPending(false), 500);
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
