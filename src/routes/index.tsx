import { createFileRoute } from "@tanstack/react-router";

import { InvestmentRecordsPage } from "@/components/InvestmentRecordsPage";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return <InvestmentRecordsPage />;
}
