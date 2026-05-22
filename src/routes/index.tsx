import { createFileRoute } from "@tanstack/react-router";

import { InvestmentRecordsPage } from "@/features/investment/InvestmentRecordsPage";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return <InvestmentRecordsPage />;
}
