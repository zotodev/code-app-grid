import { useInfiniteQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

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
			console.log(`[ServiceDataGrid] Fetching page for "${queryKey}"`, {
				pageParam,
				pageSize,
				orderBy,
				filter: filter || "(none)",
			});

			const result = await service.getAll({
				maxPageSize: pageSize,
				orderBy: orderBy.length ? orderBy : undefined,
				filter: filter || undefined,
				skipToken: pageParam ?? undefined,
			});

			console.log(`[ServiceDataGrid] Response for "${queryKey}"`, {
				success: result.success,
				recordCount: result.data?.length,
				skipToken: result.skipToken ?? "(none — last page)",
				totalCount: result.count,
			});

			if (!result.success) {
				throw result.error ?? new Error(`Failed to fetch ${queryKey}`);
			}

			return result;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => {
			const nextToken = lastPage.skipToken ?? undefined;
			console.log(
				`[ServiceDataGrid] getNextPageParam for "${queryKey}":`,
				nextToken ? `"${nextToken}"` : "undefined (no more pages)",
			);
			return nextToken;
		},
	});

	// ─── Flatten all pages into a single array ───
	const data = useMemo(() => {
		const flattened = query.data?.pages.flatMap((page) => page.data) ?? [];
		console.log(`[ServiceDataGrid] Flattened data for "${queryKey}":`, {
			pageCount: query.data?.pages.length ?? 0,
			totalRecords: flattened.length,
			hasNextPage: query.hasNextPage,
		});
		return flattened;
	}, [query.data, query.hasNextPage, queryKey]);

	// ─── Total record count (from first page if available) ───
	const totalCount = useMemo(() => {
		const firstPage = query.data?.pages[0];
		return firstPage?.count ?? undefined;
	}, [query.data]);

	// ─── Scroll handler for infinite scroll (called from grid's scroll event) ───
	const onGridScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			if (!query.hasNextPage || query.isFetchingNextPage) return;

			const target = event.currentTarget;
			const scrollBottom =
				target.scrollHeight - target.scrollTop - target.clientHeight;

			// Fetch next page when within 300px of bottom
			if (scrollBottom < 300) {
				console.log(
					`[ServiceDataGrid] Scroll threshold reached for "${queryKey}", fetching next page`,
				);
				query.fetchNextPage();
			}
		},
		[query, queryKey],
	);

	// ─── Wire into DiceUI useDataGrid ───
	const dataGrid = useDataGrid<T>({
		data,
		columns,
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
		onGridScroll,
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
		isFetchingNextPage: query.isFetchingNextPage,

		// Top-level loading/error states
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
