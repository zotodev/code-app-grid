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
	title?: string;
}

export function ServiceDataGridToolbar<TData>({
	table,
	totalCount: _totalCount,
	dataCount: _dataCount,
	isLoading,
	isFetchingNextPage,
	className,
	title,
}: ServiceDataGridToolbarProps<TData>) {
	const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

	return (
		<div
			data-slot="service-grid-toolbar"
			className={cn(
				"flex items-center justify-between gap-2",
				className,
			)}
		>
			{/* Left: title */}
			{title ? (
				<span className="text-sm font-semibold text-foreground">{title}</span>
			) : (
				<div />
			)}

			{/* Right: controls + badges */}
			<div className="flex flex-wrap items-center gap-2">
				{selectedRowCount > 0 && (
					<Badge variant="secondary" className="text-xs font-normal">
						{selectedRowCount.toLocaleString()} selected
					</Badge>
				)}
				{(isLoading || isFetchingNextPage) && (
					<Loader2 className="size-3.5 animate-spin" />
				)}

				{/* Filter menu */}
				<DataGridFilterMenu table={table} />

				{/* Sort menu */}
				<DataGridSortMenu table={table} />

				{/* Row height selector */}
				<DataGridRowHeightMenu table={table} />

				{/* View / column visibility */}
				<DataGridViewMenu table={table} />
			</div>
		</div>
	);
}
