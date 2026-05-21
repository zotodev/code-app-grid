import type { ColumnDef } from "@tanstack/react-table";

import type { IGetAllOptions } from "@/generated/models/CommonModels";
import type { IOperationResult } from "@microsoft/power-apps/data";

/**
 * The interface any generated Power Platform service must satisfy
 * to be used with ServiceDataGrid. All generated services already
 * conform to this (e.g. Zap_todo1sService, Zap_investmentrecordsService).
 */
export interface DataService<T> {
	getAll(options?: IGetAllOptions): Promise<IOperationResult<T[]>>;
}

/**
 * Configuration for the ServiceDataGrid component.
 * Pass one of these per entity to get a fully-functional data grid
 * with infinite scroll, server-side sorting and filtering.
 */
export interface ServiceDataGridConfig<T> {
	/** Unique query key prefix for React Query cache isolation */
	queryKey: string;
	/** The service class — must expose a static `getAll` method */
	service: DataService<T>;
	/** TanStack Table column definitions (use helpers from columns/ dir) */
	columns: ColumnDef<T, unknown>[];
	/** Default sort applied on mount (maps to OData $orderby) */
	defaultSort?: { id: string; desc: boolean }[];
	/** Records per page for infinite loading. Default: 50 */
	pageSize?: number;
	/** Column field name used as the unique row identifier */
	idField: keyof T & string;
	/** When true, disables all editing interactions. Default: true */
	readOnly?: boolean;
}
