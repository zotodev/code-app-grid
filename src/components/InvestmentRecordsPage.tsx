import { investmentColumns } from "@/components/data-grid/columns/investment-columns";
import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import { GridModeToggle } from "@/components/GridModeToggle";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

interface InvestmentRecordsPageProps {
	readOnly?: boolean;
}

export function InvestmentRecordsPage({
	readOnly = true,
}: InvestmentRecordsPageProps) {
	return (
		<div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
			<GridModeToggle />
			<ServiceDataGrid
				config={{
					queryKey: readOnly ? "investments" : "investments-editable",
					service: Zap_investmentrecordsService,
					columns: investmentColumns,
					idField: "zap_investmentrecordid",
					defaultSort: [{ id: "createdon", desc: true }],
					readOnly,
				}}
			/>
		</div>
	);
}
