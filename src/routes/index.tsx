import { createFileRoute } from "@tanstack/react-router";

import { investmentColumns } from "@/components/data-grid/columns/investment-columns";
import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

export const Route = createFileRoute("/")(  {
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex-1 p-6 flex flex-col gap-4">
			<ServiceDataGrid
				config={{
					queryKey: "investments",
					service: Zap_investmentrecordsService,
					columns: investmentColumns,
					idField: "zap_investmentrecordid",
					defaultSort: [{ id: "createdon", desc: true }],
				}}
				height={600}
			/>
		</div>
	);
}
