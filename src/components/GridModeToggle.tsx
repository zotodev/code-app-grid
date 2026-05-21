import { Link, useLocation } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function GridModeToggle() {
	const { pathname } = useLocation();
	const isEditable = pathname === "/editable";

	return (
		<div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
			<Link
				to="/"
				className={cn(
					"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
					!isEditable
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				Read-only
			</Link>
			<Link
				to="/editable"
				className={cn(
					"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
					isEditable
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				Editable
			</Link>
		</div>
	);
}
