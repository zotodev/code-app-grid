import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type TableOptions,
	type TableState,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { ExtendedColumnSort, QueryKeys } from "@/types/data-table";

const PAGE_KEY = "page";
const PER_PAGE_KEY = "perPage";
const SORT_KEY = "sort";
const FILTERS_KEY = "filters";
const JOIN_OPERATOR_KEY = "joinOperator";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

interface UseDataTableProps<TData>
	extends Omit<
			TableOptions<TData>,
			| "state"
			| "pageCount"
			| "getCoreRowModel"
			| "manualFiltering"
			| "manualPagination"
			| "manualSorting"
		>,
		Required<Pick<TableOptions<TData>, "pageCount">> {
	initialState?: Omit<Partial<TableState>, "sorting"> & {
		sorting?: ExtendedColumnSort<TData>[];
	};
	queryKeys?: Partial<QueryKeys>;
	history?: "push" | "replace";
	debounceMs?: number;
	throttleMs?: number;
	clearOnDefault?: boolean;
	enableAdvancedFilter?: boolean;
	scroll?: boolean;
	shallow?: boolean;
	startTransition?: React.TransitionStartFunction;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
	const {
		columns,
		pageCount = -1,
		initialState,
		queryKeys,
		history = "replace",
		debounceMs = DEBOUNCE_MS,
		throttleMs = THROTTLE_MS,
		clearOnDefault = false,
		enableAdvancedFilter = false,
		scroll = false,
		shallow = true,
		startTransition,
		...tableProps
	} = props;
	const pageKey = queryKeys?.page ?? PAGE_KEY;
	const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY;
	const sortKey = queryKeys?.sort ?? SORT_KEY;
	const filtersKey = queryKeys?.filters ?? FILTERS_KEY;
	const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY;

	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
		initialState?.rowSelection ?? {},
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>(initialState?.columnVisibility ?? {});

	// Use React state instead of nuqs
	const [page, setPage] = React.useState<number>(1);
	const [perPage, setPerPage] = React.useState<number>(
		initialState?.pagination?.pageSize ?? 10,
	);

	const pagination: PaginationState = React.useMemo(() => {
		return {
			pageIndex: page - 1,
			pageSize: perPage,
		};
	}, [page, perPage]);

	const onPaginationChange = React.useCallback(
		(updaterOrValue: Updater<PaginationState>) => {
			if (typeof updaterOrValue === "function") {
				const newPagination = updaterOrValue(pagination);
				setPage(newPagination.pageIndex + 1);
				setPerPage(newPagination.pageSize);
			} else {
				setPage(updaterOrValue.pageIndex + 1);
				setPerPage(updaterOrValue.pageSize);
			}
		},
		[pagination],
	);

	const columnIds = React.useMemo(() => {
		return new Set(
			columns.map((column) => column.id).filter(Boolean) as string[],
		);
	}, [columns]);

	const [sorting, setSorting] = React.useState<SortingState>(
		(initialState?.sorting as SortingState) ?? [],
	);

	const onSortingChange = React.useCallback(
		(updaterOrValue: Updater<SortingState>) => {
			if (typeof updaterOrValue === "function") {
				setSorting((prev) => updaterOrValue(prev));
			} else {
				setSorting(updaterOrValue);
			}
		},
		[],
	);

	const filterableColumns = React.useMemo(() => {
		if (enableAdvancedFilter) return [];
		return columns.filter((column) => column.enableColumnFilter);
	}, [columns, enableAdvancedFilter]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const onColumnFiltersChange = React.useCallback(
		(updaterOrValue: Updater<ColumnFiltersState>) => {
			if (enableAdvancedFilter) return;

			setColumnFilters((prev) => {
				const next =
					typeof updaterOrValue === "function"
						? updaterOrValue(prev)
						: updaterOrValue;
				return next;
			});
		},
		[enableAdvancedFilter],
	);

	const table = useReactTable({
		...tableProps,
		columns,
		initialState,
		pageCount,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		defaultColumn: {
			...tableProps.defaultColumn,
			enableColumnFilter: false,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		meta: {
			...tableProps.meta,
			queryKeys: {
				page: pageKey,
				perPage: perPageKey,
				sort: sortKey,
				filters: filtersKey,
				joinOperator: joinOperatorKey,
			},
		},
	});

	return React.useMemo(
		() => ({ table, shallow, debounceMs, throttleMs }),
		[table, shallow, debounceMs, throttleMs],
	);
}
