import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

import { columns } from "./columns";

interface InvestmentDataGridProps {
	readOnly?: boolean;
	className?: string;
}

export function InvestmentDataGrid({
	readOnly = true,
	className,
}: InvestmentDataGridProps) {
	return (
		<ServiceDataGrid<Zap_investmentrecords>
			className={className}
			config={{
				queryKey: readOnly ? "investments" : "investments-editable",
				service: Zap_investmentrecordsService,
				columns,
				idField: "zap_investmentrecordid",
				defaultSort: [{ id: "createdon", desc: true }],
				readOnly,
			}}
		/>
	);
}
