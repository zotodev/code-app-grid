import type { IOperationResult } from "@microsoft/power-apps/data";
import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { getDataGridSelectColumn } from "../../data-grid-select-column";
import { useDataGrid } from "../../hooks/use-data-grid";
import type { DataverseGridConfig } from "../types/dataverse-grid-config";
import { filtersToOData, sortingToOData } from "../lib/odata-filters";

const DEFAULT_PAGE_SIZE = 50;

type RowUpdate<T> = {
	id: string;
	changedFields: Partial<T>;
};

function getUpdatableFieldKeys<T>(columns: ColumnDef<T, unknown>[]): string[] {
	return columns
		.map((column) => {
			if (column.id === "select") return undefined;
			if ("accessorKey" in column && column.accessorKey) {
				return String(column.accessorKey);
			}
			return column.id;
		})
		.filter((field): field is string => Boolean(field));
}

function valuesEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (a == null && b == null) return true;
	if (typeof a === "number" && typeof b === "string") {
		return a === Number(b);
	}
	if (typeof a === "string" && typeof b === "number") {
		return Number(a) === b;
	}
	return false;
}

function coerceUpdateValue(oldValue: unknown, newValue: unknown): unknown {
	if (
		typeof oldValue === "number" &&
		typeof newValue === "string" &&
		newValue !== ""
	) {
		const parsed = Number(newValue);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return newValue;
}

function collectRowUpdates<T extends Record<string, unknown>>(
	oldData: T[],
	newData: T[],
	fields: string[],
	idField: keyof T & string,
): RowUpdate<T>[] {
	const updates: RowUpdate<T>[] = [];

	for (let index = 0; index < newData.length; index++) {
		const oldRow = oldData[index];
		const newRow = newData[index];
		if (!oldRow || !newRow) continue;

		const changedFields: Partial<T> = {};

		for (const field of fields) {
			const oldValue = oldRow[field];
			const newValue = newRow[field];
			if (valuesEqual(oldValue, newValue)) continue;

			changedFields[field as keyof T] = coerceUpdateValue(
				oldValue,
				newValue,
			) as T[keyof T];
		}

		if (Object.keys(changedFields).length > 0) {
			updates.push({
				id: String(newRow[idField]),
				changedFields,
			});
		}
	}

	return updates;
}

function patchInfiniteQueryCache<T extends Record<string, unknown>>(
	old: InfiniteData<IOperationResult<T[]>> | undefined,
	newData: T[],
	idField: keyof T & string,
): InfiniteData<IOperationResult<T[]>> | undefined {
	if (!old) return old;

	const rowById = new Map(newData.map((row) => [String(row[idField]), row]));

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			data: page.data?.map((row) => rowById.get(String(row[idField])) ?? row) ?? [],
		})),
	};
}

/**
 * Bridges React Query infinite loading with the DiceUI useDataGrid hook.
 *
 * This hook:
 * 1. Manages sorting and column filter state
 * 2. Translates that state into OData parameters for the service
 * 3. Uses useInfiniteQuery with skipToken-based cursor pagination
 * 4. Flattens all pages into a single data array for useDataGrid
 * 5. Configures useDataGrid with manualSorting + manualFiltering (server-side)
 * 6. Persists cell edits via service.update when readOnly is false
 */
export function useDataverseGrid<T extends object>(
	config: DataverseGridConfig<T>,
) {
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

	const queryClient = useQueryClient();

	// ─── State for server-side sorting and filtering ───
	const [sorting, setSorting] = useState<SortingState>(defaultSort);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	// ─── Translate to OData params ───
	const orderBy = useMemo(() => sortingToOData(sorting), [sorting]);
	const filter = useMemo(
		() => filtersToOData(columnFilters, columns),
		[columnFilters, columns],
	);

	const queryKeyFull = useMemo(
		() => [queryKey, { orderBy, filter }] as const,
		[queryKey, orderBy, filter],
	);

	const updatableFields = useMemo(
		() => getUpdatableFieldKeys(columns),
		[columns],
	);

	// ─── Infinite query with cursor-based pagination ───
	const query = useInfiniteQuery({
		queryKey: queryKeyFull,
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

	const updateMutation = useMutation({
		mutationFn: async (updates: RowUpdate<T>[]) => {
			if (!service.update) {
				throw new Error("Update is not supported for this service");
			}

			const results = await Promise.all(
				updates.map(async ({ id, changedFields }) => {
					const result = await service.update!(id, changedFields);
					if (!result.success) {
						throw result.error ?? new Error("Failed to update record");
					}
					return result.data;
				}),
			);

			return results;
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: [queryKey] });
		},
	});

	const onDataChange = useCallback(
		(newData: T[]) => {
			if (readOnly || !service.update) return;

		const updates = collectRowUpdates(
			data as Record<string, unknown>[],
			newData as Record<string, unknown>[],
			updatableFields,
			idField as string,
		);
		if (updates.length === 0) return;

		queryClient.setQueryData(
			queryKeyFull,
			(old: InfiniteData<IOperationResult<T[]>> | undefined) =>
				patchInfiniteQueryCache(
					old as InfiniteData<IOperationResult<Record<string, unknown>[]>> | undefined,
					newData as Record<string, unknown>[],
					idField as string,
				) as InfiniteData<IOperationResult<T[]>> | undefined,
		);

		const updateCount = updates.length;

		toast.promise(() => updateMutation.mutateAsync(updates as RowUpdate<T>[]), {
				loading: "Saving changes...",
				success:
					updateCount === 1
						? "Record updated"
						: `${updateCount} records updated`,
				error: (error) =>
					error instanceof Error
						? error.message
						: "Failed to save changes",
			});
		},
		[
			readOnly,
			service,
			data,
			updatableFields,
			idField,
			queryClient,
			queryKeyFull,
			updateMutation,
		],
	);

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
		onDataChange: readOnly ? undefined : onDataChange,
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

		// Mutation state
		isSaving: updateMutation.isPending,
	};
}
