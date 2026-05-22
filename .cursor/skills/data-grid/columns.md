# Column definitions

Column files live in `src/features/{entity}/components/columns.tsx`. Export a typed `ColumnDef<Entity>[]` array as `columns`.

## Template

```tsx
// src/features/myentity/components/columns.tsx
import type { ColumnDef } from "@tanstack/react-table";

import type { Zap_myentity } from "@/generated/models/Zap_myentityModel";
import { getFilterFn } from "@/components/data-grid";

export const columns: ColumnDef<Zap_myentity, unknown>[] = [
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
];
```

## Cell variants

Set `meta.cell.variant` to control editing behavior and filter operators.

| Variant | Use for | Filter operators |
|---------|---------|------------------|
| `short-text` | Names, emails, phones | Text (contains, equals, …) |
| `long-text` | Notes, descriptions | Text |
| `number` | Integers, decimals, currency raw values | Number (gt, lt, between, …) |
| `select` | Option sets / enums | Select (is, isAnyOf, …) |
| `multi-select` | Multi-value option sets | Select |
| `checkbox` | Boolean fields | isTrue / isFalse |
| `date` | Date-only fields | Date |
| `datetime` | Created/modified timestamps | Date |
| `url` | URLs | Text |
| `file` | File attachments | — |

### Number options

```tsx
meta: {
  label: "Priority",
  cell: { variant: "number", min: 1, max: 10 },
},
```

### Select / enum columns

Derive options from generated enums. Store numeric keys as string values:

```tsx
import { Zap_todo1szap_status } from "@/generated/models/Zap_todo1sModel";

const statusOptions = Object.entries(Zap_todo1szap_status).map(
  ([key, label]) => ({ label, value: String(key) }),
);

{
  accessorKey: "zap_status",
  header: "Status",
  meta: {
    label: "Status",
    cell: { variant: "select", options: statusOptions },
  },
  cell: ({ row }) => {
    const value = row.getValue("zap_status") as number | undefined;
    if (value == null) return null;
    return Zap_todo1szap_status[value as keyof typeof Zap_todo1szap_status] ?? String(value);
  },
  filterFn: getFilterFn(),
}
```

## Display formatting (read-only rendering)

Add a `cell` renderer for formatted display. Keep `meta.cell.variant` as the raw type:

```tsx
// Currency
cell: ({ row }) => {
  const value = row.getValue("zap_budget") as number | undefined;
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
},

// Percentage
cell: ({ row }) => {
  const value = row.getValue("zap_stockweight") as number | undefined;
  if (value == null) return null;
  return `${value.toFixed(1)}%`;
},
```

## Column sizing

| Property | Purpose |
|----------|---------|
| `size` | Default width in px |
| `minSize` | Minimum resize width |
| `enableResizing` | Default true on data columns |

Select column (auto-prepended) uses fixed `size: 40` and disables resize/hide.

## Sorting & filtering toggles

Default: sorting and filtering enabled. Disable for computed/lookup columns:

```tsx
{
  accessorKey: "owneridname",
  header: "Owner",
  enableSorting: false,
  enableColumnFilter: false,
  meta: {
    label: "Owner",
    cell: { variant: "short-text" },
  },
  // no filterFn needed when enableColumnFilter: false
}
```

## Existing references

- Full entity example: `src/features/investment/components/columns.tsx`
- Enum + mixed types: `src/features/todos/components/columns.tsx`
