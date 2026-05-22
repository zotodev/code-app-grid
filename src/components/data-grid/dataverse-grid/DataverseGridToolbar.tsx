"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Loader2 } from "lucide-react";

import { DataGridFilterMenu } from "../data-grid-filter-menu";
import { DataGridRowHeightMenu } from "../data-grid-row-height-menu";
import { DataGridSortMenu } from "../data-grid-sort-menu";
import { DataGridViewMenu } from "../data-grid-view-menu";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface GridAction<TData> {
	/** Label shown in the dropdown */
	label: string;
	/**
	 * Called with the currently selected rows and a `clearSelection` function.
	 * Call `clearSelection()` inside your handler to reset row selection after the action.
	 */
	onAction: (rows: TData[], clearSelection: () => void) => void;
	/**
	 * Controls when this action is visible:
	 * - "single"   — only when exactly 1 row is selected
	 * - "multiple" — only when 2+ rows are selected
	 * - "any"      — whenever 1+ rows are selected (default)
	 */
	selectionMode?: "single" | "multiple" | "any";
}

interface DataverseGridToolbarProps<TData> {
	table: Table<TData>;
	totalCount?: number;
	dataCount: number;
	isLoading?: boolean;
	isFetchingNextPage?: boolean;
	className?: string;
	title?: string;
	actions?: GridAction<TData>[];
}

export function DataverseGridToolbar<TData>({
	table,
	totalCount: _totalCount,
	dataCount: _dataCount,
	isLoading,
	isFetchingNextPage,
	className,
	title,
	actions,
}: DataverseGridToolbarProps<TData>) {
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedRowCount = selectedRows.length;

	const visibleActions = actions?.filter((action) => {
		if (selectedRowCount === 0) return false;
		if (action.selectionMode === "single") return selectedRowCount === 1;
		if (action.selectionMode === "multiple") return selectedRowCount > 1;
		return true; // "any" or undefined
	});

	const hasActions = visibleActions && visibleActions.length > 0;

	return (
		<div
			data-slot="dataverse-grid-toolbar"
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
				{(isLoading || isFetchingNextPage) && (
					<Loader2 className="size-3.5 animate-spin" />
				)}

				{/* Actions dropdown — only visible when rows are selected */}
				{hasActions && (
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-8 font-normal">
								Actions
								<ChevronDown className="ml-1 size-3.5 text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							onCloseAutoFocus={(e) => e.preventDefault()}
						>
							{visibleActions.map((action) => (
								<DropdownMenuItem
									key={action.label}
									onSelect={() =>
										action.onAction(
											selectedRows.map((r) => r.original),
											() => table.resetRowSelection(),
										)
									}
								>
									{action.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
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
