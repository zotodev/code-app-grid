"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";

import { DataGrid } from "@/components/data-grid/data-grid";
import {
	DataGridSkeleton,
	DataGridSkeletonGrid,
	DataGridSkeletonToolbar,
} from "@/components/data-grid/data-grid-skeleton";
import { ServiceDataGridToolbar } from "@/components/data-grid/ServiceDataGridToolbar";
import { useServiceDataGrid } from "@/hooks/use-service-data-grid";
import { cn } from "@/lib/utils";
import type { ServiceDataGridConfig } from "@/types/service-data-grid";

interface ServiceDataGridProps<T> {
	/** Configuration for which service/columns to use */
	config: ServiceDataGridConfig<T>;
	/** Height in pixels for the virtualized grid area. Default: 600 */
	height?: number;
	/** Additional CSS class for the wrapper */
	className?: string;
}

/**
 * A reusable, service-agnostic data grid component.
 *
 * Connects any Power Platform generated service to the DiceUI DataGrid
 * with infinite scroll, server-side sorting, and server-side filtering.
 *
 * @example
 *   <ServiceDataGrid
 *     config={{
 *       queryKey: 'todos',
 *       service: Zap_todo1sService,
 *       columns: todoColumns,
 *       idField: 'zap_todo1id',
 *     }}
 *   />
 */
export function ServiceDataGrid<T>({
	config,
	height = 600,
	className,
}: ServiceDataGridProps<T>) {
	const {
		query,
		data,
		totalCount,
		hasNextPage: _hasNextPage,
		fetchNextPage: _fetchNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		onGridScroll,
		...dataGridProps
	} = useServiceDataGrid(config);

	// ─── Attach Scroll Listener to the Inner Grid Container ───
	React.useEffect(() => {
		const gridElement = dataGridProps.dataGridRef.current;
		if (!gridElement) return;

		const handleScroll = (event: Event) => {
			onGridScroll(event as unknown as React.UIEvent<HTMLDivElement>);
		};

		gridElement.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			gridElement.removeEventListener("scroll", handleScroll);
		};
	}, [dataGridProps.dataGridRef, onGridScroll]);



	// ─── Loading skeleton ───
	if (isLoading) {
		return (
			<div className={cn("flex flex-col gap-2", className)}>
				<DataGridSkeleton>
					<DataGridSkeletonToolbar actionCount={4} />
					<DataGridSkeletonGrid />
				</DataGridSkeleton>
			</div>
		);
	}

	// ─── Error state ───
	if (isError) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-12",
					className,
				)}
			>
				<AlertCircle className="size-8 text-destructive" />
				<div className="text-center">
					<p className="font-medium text-destructive">
						Failed to load data
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{error instanceof Error
							? error.message
							: "An unexpected error occurred."}
					</p>
				</div>
				<button
					type="button"
					className="mt-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
					onClick={() => query.refetch()}
				>
					Retry
				</button>
			</div>
		);
	}

	// ─── Empty state ───
	if (data.length === 0 && !_hasNextPage) {
		return (
			<div className={cn("flex flex-col gap-2", className)}>
				<ServiceDataGridToolbar
					table={dataGridProps.table}
					totalCount={totalCount}
					dataCount={0}
				/>
				<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-muted-foreground">
					<p className="text-sm">No records found</p>
					<p className="text-xs">
						Try adjusting your filters or sorting.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{/* Toolbar */}
			<ServiceDataGridToolbar
				table={dataGridProps.table}
				totalCount={totalCount}
				dataCount={data.length}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
			/>

			{/* Data grid */}
			<DataGrid {...dataGridProps} height={height} />



			{/* Bottom loading indicator */}
			{isFetchingNextPage && (
				<div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					<span>Loading more records…</span>
				</div>
			)}
		</div>
	);
}
