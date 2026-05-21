"use client";

import type { Table } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceDataGridToolbarProps<TData> {
	table: Table<TData>;
	totalCount?: number;
	dataCount: number;
	isLoading?: boolean;
	isFetchingNextPage?: boolean;
	className?: string;
}

export function ServiceDataGridToolbar<TData>({
	table,
	totalCount,
	dataCount,
	isLoading,
	isFetchingNextPage,
	className,
}: ServiceDataGridToolbarProps<TData>) {
	return (
		<div
			data-slot="service-grid-toolbar"
			className={cn(
				"flex flex-wrap items-center gap-2",
				className,
			)}
		>
			{/* Filter menu */}
			<DataGridFilterMenu table={table} />

			{/* Sort menu */}
			<DataGridSortMenu table={table} />

			{/* Row height selector */}
			<DataGridRowHeightMenu table={table} />

			{/* View / column visibility */}
			<DataGridViewMenu table={table} />

			{/* Spacer */}
			<div className="flex-1" />

			{/* Record count + loading indicator */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				{(isLoading || isFetchingNextPage) && (
					<Loader2 className="size-3.5 animate-spin" />
				)}
				<span>
					{dataCount.toLocaleString()}
					{totalCount !== undefined &&
						` of ${totalCount.toLocaleString()}`}{" "}
					records
				</span>
				{isFetchingNextPage && (
					<Badge variant="secondary" className="text-xs font-normal">
						Loading more…
					</Badge>
				)}
			</div>
		</div>
	);
}
