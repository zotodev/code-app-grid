"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";

import { DataGrid } from "../data-grid";
import {
	DataGridSkeleton,
	DataGridSkeletonGrid,
	DataGridSkeletonToolbar,
} from "../data-grid-skeleton";
import {
	DataverseGridToolbar,
	type GridAction,
} from "./DataverseGridToolbar";
import { useDataverseGrid } from "./hooks/use-dataverse-grid";
import type { DataverseGridConfig } from "./types/dataverse-grid-config";
import { cn } from "@/lib/utils";

interface DataverseGridProps<T extends object> {
	config: DataverseGridConfig<T>;
	className?: string;
	title?: string;
	actions?: GridAction<T>[];
}

export function DataverseGrid<T extends object>({
	config,
	className,
	title,
	actions,
}: DataverseGridProps<T>) {
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
	} = useDataverseGrid(config);

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
				<DataverseGridToolbar
					table={dataGridProps.table}
					totalCount={totalCount}
					dataCount={0}
					title={title}
					actions={actions}
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
			<DataverseGridToolbar
				table={dataGridProps.table}
				totalCount={totalCount}
				dataCount={data.length}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
				title={title}
				actions={actions}
			/>

			<DataGrid
				{...dataGridProps}
				sentinelRef={sentinelRef}
				className="flex-1 min-h-0"
			/>

			{/* Bottom footer: row count on left, selected count + loading on right */}
			<div
				data-slot="dataverse-grid-footer"
				className="flex items-center justify-between text-sm text-muted-foreground"
			>
				<div className="flex items-center gap-4">
					<span>
						Rows:{" "}
						{isFetchingNextPage
							? `${data.length.toLocaleString()}…`
							: data.length.toLocaleString()}
						{totalCount !== undefined &&
							totalCount !== data.length &&
							` of ${totalCount.toLocaleString()}`}
					</span>
					{dataGridProps.table.getFilteredSelectedRowModel().rows.length >
						0 && (
						<span>
							Selected:{" "}
							{dataGridProps.table
								.getFilteredSelectedRowModel()
								.rows.length.toLocaleString()}
						</span>
					)}
				</div>
				{isFetchingNextPage && (
					<div className="flex items-center gap-1.5">
						<Loader2 className="size-3.5 animate-spin" />
						<span>Loading more…</span>
					</div>
				)}
			</div>
		</div>
	);
}
