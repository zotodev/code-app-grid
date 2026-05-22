import type { ColumnDef } from "@tanstack/react-table";

import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordszap_stocktickersymbol } from "@/generated/models/Zap_investmentrecordsModel";
import { getFilterFn } from "@/lib/data-grid-filters";

const tickerOptions = Object.entries(
	Zap_investmentrecordszap_stocktickersymbol,
).map(([key, label]) => ({
	label,
	value: String(key),
}));

export const columns: ColumnDef<Zap_investmentrecords, unknown>[] = [
	{
		accessorKey: "zap_name",
		header: "Name",
		size: 200,
		minSize: 120,
		meta: {
			label: "Name",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_investorfullname",
		header: "Investor",
		size: 180,
		minSize: 120,
		meta: {
			label: "Investor",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_stocktickersymbol",
		header: "Ticker",
		size: 200,
		minSize: 130,
		meta: {
			label: "Ticker Symbol",
			cell: {
				variant: "select",
				options: tickerOptions,
			},
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_stocktickersymbol") as
				| number
				| undefined;
			if (value === undefined || value === null) return null;
			const label =
				Zap_investmentrecordszap_stocktickersymbol[
					value as keyof typeof Zap_investmentrecordszap_stocktickersymbol
				];
			return label ?? String(value);
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_stockprice",
		header: "Stock Price",
		size: 130,
		minSize: 90,
		meta: {
			label: "Stock Price",
			cell: { variant: "number", min: 0 },
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_stockprice") as number | undefined;
			if (value === undefined || value === null) return null;
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(value);
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_quantityowned",
		header: "Quantity",
		size: 110,
		minSize: 80,
		meta: {
			label: "Quantity Owned",
			cell: { variant: "number", min: 0 },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_stockweight",
		header: "Weight %",
		size: 110,
		minSize: 80,
		meta: {
			label: "Stock Weight",
			cell: { variant: "number", min: 0, max: 100 },
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_stockweight") as number | undefined;
			if (value === undefined || value === null) return null;
			return `${value.toFixed(1)}%`;
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_budgetallocated",
		header: "Budget",
		size: 130,
		minSize: 90,
		meta: {
			label: "Budget Allocated",
			cell: { variant: "number", min: 0 },
		},
		cell: ({ row }) => {
			const value = row.getValue("zap_budgetallocated") as
				| number
				| undefined;
			if (value === undefined || value === null) return null;
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(value);
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_issettled",
		header: "Settled",
		size: 100,
		minSize: 80,
		meta: {
			label: "Settled",
			cell: { variant: "checkbox" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_investoremail",
		header: "Email",
		size: 200,
		minSize: 140,
		meta: {
			label: "Investor Email",
			cell: { variant: "short-text" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_investorphonenumber",
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
		accessorKey: "zap_investorwebsite",
		header: "Website",
		size: 200,
		minSize: 140,
		meta: {
			label: "Website",
			cell: { variant: "url" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_investorbirthdate",
		header: "Birth Date",
		size: 140,
		minSize: 110,
		meta: {
			label: "Birth Date",
			cell: { variant: "date" },
		},
		filterFn: getFilterFn(),
	},
	{
		accessorKey: "zap_recordcreatedon",
		header: "Record Created",
		size: 160,
		minSize: 120,
		meta: {
			label: "Record Created On",
			cell: { variant: "datetime" },
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
