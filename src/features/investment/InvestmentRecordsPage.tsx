import { InvestmentDataGrid } from "@/features/investment/components/data-grid";
import { GridModeToggle } from "@/features/investment/components/grid-mode-toggle";

interface InvestmentRecordsPageProps {
	readOnly?: boolean;
}

export function InvestmentRecordsPage({
	readOnly = true,
}: InvestmentRecordsPageProps) {
	return (
		<div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
			<GridModeToggle />
			<InvestmentDataGrid readOnly={readOnly} />
		</div>
	);
}
