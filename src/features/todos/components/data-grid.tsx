import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import type { Zap_todo1s } from "@/generated/models/Zap_todo1sModel";
import { Zap_todo1sService } from "@/generated/services/Zap_todo1sService";

import { columns } from "./columns";

interface TodosDataGridProps {
	readOnly?: boolean;
	className?: string;
}

export function TodosDataGrid({
	readOnly = true,
	className,
}: TodosDataGridProps) {
	return (
		<ServiceDataGrid<Zap_todo1s>
			className={className}
			title="Active Todos"
			config={{
				queryKey: readOnly ? "todos" : "todos-editable",
				service: Zap_todo1sService,
				columns,
				idField: "zap_todo1id",
				defaultSort: [{ id: "zap_duedate", desc: false }],
				readOnly,
			}}
		/>
	);
}
