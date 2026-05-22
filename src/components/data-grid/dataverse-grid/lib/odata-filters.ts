import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";

import type { FilterValue } from "../../types/data-grid";

/**
 * Convert TanStack Table SortingState into OData $orderby strings.
 *
 * @example
 *   sortingToOData([{ id: "zap_taskname", desc: false }])
 *   // => ["zap_taskname asc"]
 */
export function sortingToOData(sorting: SortingState): string[] {
	return sorting.map((s) => `${s.id} ${s.desc ? "desc" : "asc"}`);
}

/**
 * Escape a string for use inside an OData $filter string literal.
 * Single quotes are doubled per OData spec.
 */
function escapeODataString(value: string): string {
	return value.replace(/'/g, "''");
}

/**
 * Get the OData variant type for a column, used to decide
 * how to format filter values (string vs number vs date).
 */
function getColumnVariant(
	columnId: string,
	columns: ColumnDef<unknown, unknown>[],
): string {
	for (const col of columns) {
		const id =
			col.id ?? ("accessorKey" in col ? (col.accessorKey as string) : "");
		if (id === columnId) {
			return col.meta?.cell?.variant ?? "short-text";
		}
	}
	return "short-text";
}

/**
 * Convert a single filter into an OData $filter expression.
 * Returns null if the filter cannot be translated (e.g. empty value).
 */
function filterToOData(
	columnId: string,
	filterValue: FilterValue,
	variant: string,
): string | null {
	const { operator, value, endValue } = filterValue;

	// Operators that don't need a value
	if (operator === "isEmpty") {
		return `${columnId} eq null`;
	}
	if (operator === "isNotEmpty") {
		return `${columnId} ne null`;
	}
	if (operator === "isTrue") {
		return `${columnId} eq true`;
	}
	if (operator === "isFalse") {
		return `${columnId} eq false`;
	}

	// Skip if value is empty/undefined
	if (value === undefined || value === null || value === "") {
		return null;
	}

	// Determine if this is a numeric, option-set, or date column
	const isNumeric = variant === "number";
	const isOptionSet = variant === "select" || variant === "multi-select";
	const isDate = variant === "date" || variant === "datetime";

	// Format the value based on type
	const formatValue = (v: string | number | string[]): string => {
		if (typeof v === "number") return String(v);
		if ((isNumeric || isOptionSet) && typeof v === "string") {
			const num = Number(v);
			if (!Number.isNaN(num)) return String(num);
		}
		if (isDate && typeof v === "string") {
			// OData date format
			return v;
		}
		if (typeof v === "string") return `'${escapeODataString(v)}'`;
		return `'${escapeODataString(String(v))}'`;
	};

	switch (operator) {
		case "contains":
			return `contains(${columnId},${formatValue(value)})`;

		case "notContains":
			return `not contains(${columnId},${formatValue(value)})`;

		case "equals":
			return `${columnId} eq ${formatValue(value)}`;

		case "notEquals":
			return `${columnId} ne ${formatValue(value)}`;

		case "startsWith":
			return `startswith(${columnId},${formatValue(value)})`;

		case "endsWith":
			return `endswith(${columnId},${formatValue(value)})`;

		case "greaterThan":
			return `${columnId} gt ${formatValue(value)}`;

		case "greaterThanOrEqual":
			return `${columnId} ge ${formatValue(value)}`;

		case "lessThan":
			return `${columnId} lt ${formatValue(value)}`;

		case "lessThanOrEqual":
			return `${columnId} le ${formatValue(value)}`;

		case "isBetween":
			if (endValue !== undefined && endValue !== null && endValue !== "") {
				return `${columnId} ge ${formatValue(value)} and ${columnId} le ${formatValue(endValue)}`;
			}
			return `${columnId} ge ${formatValue(value)}`;

		case "before":
			return `${columnId} lt ${formatValue(value)}`;

		case "after":
			return `${columnId} gt ${formatValue(value)}`;

		case "onOrBefore":
			return `${columnId} le ${formatValue(value)}`;

		case "onOrAfter":
			return `${columnId} ge ${formatValue(value)}`;

		// Select operators
		case "is":
			return `${columnId} eq ${formatValue(value)}`;

		case "isNot":
			return `${columnId} ne ${formatValue(value)}`;

		case "isAnyOf":
			if (Array.isArray(value) && value.length > 0) {
				const conditions = value.map(
					(v) => `${columnId} eq ${formatValue(v)}`,
				);
				return `(${conditions.join(" or ")})`;
			}
			return null;

		case "isNoneOf":
			if (Array.isArray(value) && value.length > 0) {
				const conditions = value.map(
					(v) => `${columnId} ne ${formatValue(v)}`,
				);
				return `(${conditions.join(" and ")})`;
			}
			return null;

		default:
			return null;
	}
}

/**
 * Convert TanStack Table ColumnFiltersState into an OData $filter string.
 * Multiple filters are combined with `and`.
 *
 * @example
 *   filtersToOData(
 *     [{ id: "zap_taskname", value: { operator: "contains", value: "test" } }],
 *     columns
 *   )
 *   // => "contains(zap_taskname,'test')"
 */
export function filtersToOData<T>(
	filters: ColumnFiltersState,
	columns: ColumnDef<T, unknown>[],
): string {
	const parts: string[] = [];

	for (const filter of filters) {
		const filterValue = filter.value as FilterValue | undefined;
		if (!filterValue) continue;

		const variant = getColumnVariant(
			filter.id,
			columns as ColumnDef<unknown, unknown>[],
		);
		const expression = filterToOData(filter.id, filterValue, variant);
		if (expression) {
			parts.push(expression);
		}
	}

	return parts.join(" and ");
}
