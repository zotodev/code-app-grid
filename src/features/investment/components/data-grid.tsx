import {
	DataverseGrid,
	type GridAction,
} from "@/components/data-grid/dataverse-grid";
import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

import { columns, NAVIGATE_COLUMN_ID } from "./columns";

interface InvestmentDataGridProps {
	readOnly?: boolean;
	className?: string;
}

const actions: GridAction<Zap_investmentrecords>[] = [
	{
		label: "Single action",
		selectionMode: "single",
		onAction: (rows: Zap_investmentrecords[], clearSelection) => {
			console.log("Single action on", rows[0]);
			clearSelection();
		},
	},
	{
		label: "Multiple action",
		selectionMode: "multiple",
		onAction: (rows: Zap_investmentrecords[], clearSelection) => {
			console.log("Multiple action on", rows.length, "records", rows);
			clearSelection();
		},
	},
];

export function InvestmentDataGrid({
	readOnly = true,
	className,
}: InvestmentDataGridProps) {
	return (
		<DataverseGrid<Zap_investmentrecords>
			className={className}
			title="Active Investment Record"
			actions={actions}
			config={{
				queryKey: readOnly ? "investments" : "investments-editable",
				service: Zap_investmentrecordsService,
				columns,
				idField: "zap_investmentrecordid",
				defaultSort: [{ id: "createdon", desc: true }],
				readOnly,
				initialColumnPinning: {
					right: [NAVIGATE_COLUMN_ID],
				},
				initialColumnVisibility: {
					zap_budgetallocated: false,
				},
			}}
		/>
	);
}
