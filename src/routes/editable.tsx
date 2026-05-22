import { createFileRoute } from "@tanstack/react-router";

import { InvestmentRecordsPage } from "@/features/investment/InvestmentRecordsPage";

export const Route = createFileRoute("/editable")({
	component: EditablePage,
});

function EditablePage() {
	return <InvestmentRecordsPage readOnly={false} />;
}
