import { useInfiniteQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import { useDataGrid } from "@/hooks/use-data-grid";
import { filtersToOData, sortingToOData } from "@/lib/odata-filters";
import type { ServiceDataGridConfig } from "@/types/service-data-grid";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Bridges React Query infinite loading with the DiceUI useDataGrid hook.
 *
 * This hook:
 * 1. Manages sorting and column filter state
 * 2. Translates that state into OData parameters for the service
 * 3. Uses useInfiniteQuery with skipToken-based cursor pagination
 * 4. Flattens all pages into a single data array for useDataGrid
 * 5. Configures useDataGrid with manualSorting + manualFiltering (server-side)
 */
export function useServiceDataGrid<T>(config: ServiceDataGridConfig<T>) {
	const {
		queryKey,
		service,
		columns,
		defaultSort = [],
		pageSize = DEFAULT_PAGE_SIZE,
		idField,
		readOnly = true,
		enableRowSelection = true,
	} = config;

	// ─── State for server-side sorting and filtering ───
	const [sorting, setSorting] = useState<SortingState>(defaultSort);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	// ─── Translate to OData params ───
	const orderBy = useMemo(() => sortingToOData(sorting), [sorting]);
	const filter = useMemo(
		() => filtersToOData(columnFilters, columns),
		[columnFilters, columns],
	);

	// ─── Infinite query with cursor-based pagination ───
	const query = useInfiniteQuery({
		queryKey: [queryKey, { orderBy, filter }],
		queryFn: async ({ pageParam }) => {
			const result = await service.getAll({
				maxPageSize: pageSize,
				orderBy: orderBy.length ? orderBy : undefined,
				filter: filter || undefined,
				skipToken: pageParam ?? undefined,
			});

			if (!result.success) {
				throw result.error ?? new Error(`Failed to fetch ${queryKey}`);
			}

			return result;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.skipToken ?? undefined,
	});

	// ─── Flatten all pages into a single array ───
	const data = useMemo(() => {
		return query.data?.pages.flatMap((page) => page.data) ?? [];
	}, [query.data]);

	// ─── Total record count (from first page if available) ───
	const totalCount = useMemo(() => {
		const firstPage = query.data?.pages[0];
		return firstPage?.count ?? undefined;
	}, [query.data]);

	// ─── Prepend select column when enabled ───
	const tableColumns = useMemo(() => {
		if (!enableRowSelection) return columns;
		if (columns.some((column) => column.id === "select")) return columns;
		return [getDataGridSelectColumn<T>({ readOnly: false }), ...columns];
	}, [columns, enableRowSelection]);

	// ─── Wire into DiceUI useDataGrid ───
	const dataGrid = useDataGrid<T>({
		data,
		columns: tableColumns,
		enableRowSelection,
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		manualSorting: true,
		manualFiltering: true,
		getRowId: (row) => String(row[idField]),
		readOnly,
		enableSearch: true,
	});

	return {
		// DiceUI data grid props (spread into <DataGrid />)
		...dataGrid,

		// React Query state
		query,
		data,
		totalCount,

		// Infinite scroll
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
		isFetchingNextPage: query.isFetchingNextPage,

		// Top-level loading/error states
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
