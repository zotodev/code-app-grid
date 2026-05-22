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

interface ServiceDataGridProps<T extends Record<string, unknown>> {
	config: ServiceDataGridConfig<T>;
	className?: string;
}

export function ServiceDataGrid<T extends Record<string, unknown>>({
	config,
	className,
}: ServiceDataGridProps<T>) {
	const {
		query,
		data,
		totalCount,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		isSaving: _isSaving,
		...dataGridProps
	} = useServiceDataGrid(config);

	const sentinelRef = React.useRef<HTMLDivElement>(null);

	// IntersectionObserver on sentinel to trigger fetching next page
	React.useEffect(() => {
		const sentinel = sentinelRef.current;
		const root = dataGridProps.dataGridRef.current;
		if (!sentinel || !root) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ root, rootMargin: "0px 0px 300px 0px", threshold: 0 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [dataGridProps.dataGridRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) {
		return (
			<div className={cn("flex flex-1 flex-col gap-2", className)}>
				<DataGridSkeleton>
					<DataGridSkeletonToolbar actionCount={4} />
					<DataGridSkeletonGrid />
				</DataGridSkeleton>
			</div>
		);
	}

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

	if (data.length === 0 && !hasNextPage) {
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
		<div
			className={cn("flex flex-1 flex-col gap-2 min-h-0", className)}
		>
			<ServiceDataGridToolbar
				table={dataGridProps.table}
				totalCount={totalCount}
				dataCount={data.length}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
			/>

			<DataGrid
				{...dataGridProps}
				sentinelRef={sentinelRef}
				className="flex-1 min-h-0"
			/>

			{isFetchingNextPage && (
				<div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					<span>Loading more records…</span>
				</div>
			)}
		</div>
	);
}
