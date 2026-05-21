import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex-1 p-6">
			{/* Write your code here */}
		</div>
	);
}


