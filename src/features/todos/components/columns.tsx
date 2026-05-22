import type { ColumnDef } from "@tanstack/react-table";

import type { Zap_todo1s } from "@/generated/models/Zap_todo1sModel";
import { Zap_todo1szap_status } from "@/generated/models/Zap_todo1sModel";
import { getFilterFn } from "@/components/data-grid";

const statusOptions = Object.entries(Zap_todo1szap_status).map(
	([key, label]) => ({
		label,
		value: String(key),
	}),
);

export const columns: ColumnDef<Zap_todo1s, unknown>[] = [
	{
		accessorKey: "zap_taskname",
		header: "Task Name",
		size: 220,
		minSize: 120,
		meta: {
			label: "Task Name",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_status",
		header: "Status",
		size: 140,
		minSize: 100,
		meta: {
			label: "Status",
			cell: {
				variant: "select",
				options: statusOptions,
			},
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_status") as number | undefined;
			if (value === undefined || value === null) return null;
			const label =
				Zap_todo1szap_status[value as keyof typeof Zap_todo1szap_status];
			return label ?? String(value);
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_priority",
		header: "Priority",
		size: 100,
		minSize: 80,
		meta: {
			label: "Priority",
			cell: { variant: "number", min: 1, max: 10 },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_duedate",
		header: "Due Date",
		size: 140,
		minSize: 110,
		meta: {
			label: "Due Date",
			cell: { variant: "date" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_budget",
		header: "Budget",
		size: 120,
		minSize: 90,
		meta: {
			label: "Budget",
			cell: { variant: "number", min: 0 },
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_budget") as number | undefined;
			if (value === undefined || value === null) return null;
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(value);
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_estimatedhours",
		header: "Est. Hours",
		size: 110,
		minSize: 80,
		meta: {
			label: "Estimated Hours",
			cell: { variant: "number", min: 0 },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_isrecurring",
		header: "Recurring",
		size: 100,
		minSize: 80,
		meta: {
			label: "Recurring",
			cell: { variant: "checkbox" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_contactemail",
		header: "Contact Email",
		size: 200,
		minSize: 140,
		meta: {
			label: "Contact Email",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_contactphone",
		header: "Phone",
		size: 140,
		minSize: 100,
		meta: {
			label: "Phone",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_referenceurl",
		header: "Reference URL",
		size: 200,
		minSize: 140,
		meta: {
			label: "Reference URL",
			cell: { variant: "url" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_notes",
		header: "Notes",
		size: 250,
		minSize: 150,
		meta: {
			label: "Notes",
			cell: { variant: "long-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "createdon",
		header: "Created On",
		size: 160,
		minSize: 120,
		enableSorting: true,
		meta: {
			label: "Created On",
			cell: { variant: "datetime" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "modifiedon",
		header: "Modified On",
		size: 160,
		minSize: 120,
		enableSorting: true,
		meta: {
			label: "Modified On",
			cell: { variant: "datetime" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "owneridname",
		header: "Owner",
		size: 160,
		minSize: 120,
		enableSorting: false,
		enableColumnFilter: false,
		meta: {
			label: "Owner",
			cell: { variant: "short-text" },
		},
	},
];
