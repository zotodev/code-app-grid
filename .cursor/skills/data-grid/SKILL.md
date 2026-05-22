---
name: data-grid
description: >-
  Build and configure Power Platform entity grids using DataverseGrid, column
  definitions, and useDataverseGrid. Use when adding a new entity grid page,
  defining columns, enabling editing, sorting, filtering, or infinite scroll
  for tabular data in this project.
---

# Data Grid

This project wraps a DiceUI-style spreadsheet grid with Power Platform services. The standard path is **DataverseGrid** — do not wire `useDataGrid` + React Query manually unless building a non-service grid.

## Architecture

```
Page (src/features/{entity}/)
  └─ EntityDataGrid (features/{entity}/components/data-grid.tsx)
       └─ <DataverseGrid config={...} />  (shared, src/components/data-grid/)
            └─ useDataverseGrid(config)
                 ├─ useInfiniteQuery → service.getAll (OData filter/sort/skipToken)
                 └─ useDataGrid → <DataGrid /> (virtualized cells, keyboard nav, search)
```

| Layer | Location | Role |
|-------|----------|------|
| Page | `src/features/{entity}/*Page.tsx` | Compose feature grid + page chrome |
| Entity grid | `src/features/{entity}/components/data-grid.tsx` | Wires `DataverseGrid` config for one entity |
| Columns | `src/features/{entity}/components/columns.tsx` | TanStack `ColumnDef[]` for that entity |
| Generic grid | `src/components/data-grid/` | UI, hooks, lib, types (spreadsheet layer) |
| Dataverse grid | `src/components/data-grid/dataverse-grid/` | `DataverseGrid`, OData hook, config types |
| Dataverse hook | `dataverse-grid/hooks/use-dataverse-grid.ts` | React Query + OData + edit persistence |
| OData filters | `dataverse-grid/lib/odata-filters.ts` | Sort/filter state → OData |

**Do not** put entity-specific columns or configs inside `src/components/data-grid/`. Entity code stays in `src/features/{entity}/`.

## Quick start — new entity grid

```
- [ ] 1. Create feature folder: src/features/{entity}/components/
- [ ] 2. Add columns.tsx with ColumnDef[] exported as `columns`
- [ ] 3. Add data-grid.tsx wrapping DataverseGrid with entity config
- [ ] 4. Add {Entity}Page.tsx that renders the feature data grid
- [ ] 5. Wire route in src/routes/
- [ ] 6. Verify idField matches the entity primary key field
- [ ] 7. Use a unique queryKey (change when readOnly toggles)
```

**Feature folder layout** (see `src/features/investment/`):

```
src/features/investment/
├── InvestmentRecordsPage.tsx
└── components/
    ├── columns.tsx          # ColumnDef<Zap_investmentrecords>[]
    ├── data-grid.tsx        # InvestmentDataGrid → DataverseGrid
    └── grid-mode-toggle.tsx # Feature-specific UI (optional)
```

**Entity data grid** (`src/features/investment/components/data-grid.tsx`):

```tsx
import { DataverseGrid } from "@/components/data-grid/dataverse-grid";
import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

import { columns } from "./columns";

export function InvestmentDataGrid({ readOnly = true }: { readOnly?: boolean }) {
  return (
    <DataverseGrid<Zap_investmentrecords>
      config={{
        queryKey: readOnly ? "investments" : "investments-editable",
        service: Zap_investmentrecordsService,
        columns,
        idField: "zap_investmentrecordid",
        defaultSort: [{ id: "createdon", desc: true }],
        readOnly,
      }}
    />
  );
}
```

**Page** (`src/features/investment/InvestmentRecordsPage.tsx`):

```tsx
import { InvestmentDataGrid } from "@/features/investment/components/data-grid";
import { GridModeToggle } from "@/features/investment/components/grid-mode-toggle";

export function InvestmentRecordsPage({ readOnly = true }: { readOnly?: boolean }) {
  return (
    <div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
      <GridModeToggle />
      <InvestmentDataGrid readOnly={readOnly} />
    </div>
  );
}
```

## DataverseGridConfig

| Option | Required | Default | Notes |
|--------|----------|---------|-------|
| `queryKey` | yes | — | React Query cache key; use different keys for read-only vs editable |
| `service` | yes | — | Generated `*Service` with static `getAll` |
| `columns` | yes | — | `ColumnDef<T>[]` from `src/features/{entity}/components/columns.tsx` |
| `idField` | yes | — | Primary key field on the model (e.g. `zap_todo1id`) |
| `defaultSort` | no | `[]` | `[{ id: "createdon", desc: true }]` → OData `$orderby` |
| `pageSize` | no | `50` | Infinite-scroll page size |
| `readOnly` | no | `true` | `false` enables in-cell editing + `service.update` |
| `enableRowSelection` | no | `true` | Prepends checkbox column via `getDataGridSelectColumn` |
| `initialColumnVisibility` | no | all visible | Hide columns on load — see below |
| `initialColumnPinning` | no | none pinned | Pin columns left/right on load — see below |

## Initial column visibility

Use `initialColumnVisibility` to hide columns when the grid first loads. Keys are the column `accessorKey` (OData field name) or column `id` for action columns; set to `false` to hide.

```tsx
<DataverseGrid<Zap_investmentrecords>
  config={{
    queryKey: "investments",
    service: Zap_investmentrecordsService,
    columns,
    idField: "zap_investmentrecordid",
    initialColumnVisibility: {
      zap_budgetallocated: false,  // hidden on load
      zap_investorwebsite: false,  // hidden on load
      // omit columns that should be visible — default is visible
    },
  }}
/>
```

The user can still toggle hidden columns back on via the **View** menu in the toolbar. Omit a column from the map (or set to `true`) to keep it visible.

## Navigate / action column

Add a per-row action column (e.g. open record) in `columns.tsx`. Use a function `header` so the grid renders your custom `cell` directly (same pattern as the select column). Do **not** set `accessorKey` — action columns are not data fields.

**Reference:** `src/features/investment/components/columns.tsx`

```tsx
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export const NAVIGATE_COLUMN_ID = "navigate";

// append to columns array:
{
  id: NAVIGATE_COLUMN_ID,
  header: () => <span className="sr-only">Open</span>,
  cell: ({ row }) => (
    <div className="flex size-full items-center justify-center">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open record"
        onClick={(event) => {
          event.stopPropagation();
          toast.info(`Row ID: ${row.id}`);
        }}
      >
        <ExternalLink />
      </Button>
    </div>
  ),
  size: 48,
  minSize: 48,
  enableSorting: false,
  enableColumnFilter: false,
  enableHiding: false,
  enableResizing: false,
  meta: { label: "Open" },
},
```

Pin the column to the far right in `data-grid.tsx`:

```tsx
import { columns, NAVIGATE_COLUMN_ID } from "./columns";

<DataverseGrid
  config={{
    columns,
    initialColumnPinning: { right: [NAVIGATE_COLUMN_ID] },
    // ...
  }}
/>
```

Rules:
- Export a shared column id constant (e.g. `NAVIGATE_COLUMN_ID`) for use in pinning config
- Call `event.stopPropagation()` on the button click so the grid does not treat it as cell focus/selection
- `row.id` is the entity primary key (`idField` from config)
- Disable sort, filter, hide, and resize on action columns
- Replace the toast handler with navigation when wiring a real route

## Initial column pinning

Use `initialColumnPinning` to pin columns to the left or right edge when the grid first loads.

```tsx
<DataverseGrid<Zap_investmentrecords>
  config={{
    queryKey: "investments",
    service: Zap_investmentrecordsService,
    columns,
    idField: "zap_investmentrecordid",
    initialColumnPinning: {
      left: ["zap_name"],              // pinned to left
      right: [NAVIGATE_COLUMN_ID],     // pinned to right (action column id)
    },
  }}
/>
```

Rules:
- Use the column `accessorKey` (or `id` for columns without one, such as `"select"`)
- `left` and `right` are both optional arrays; omit either if not needed
- The `"select"` checkbox column is always pinned left by default — no need to include it
- Pinned columns stay fixed while the grid scrolls horizontally

## Row actions

Pass an `actions` prop to `DataverseGrid` to show an **Actions** dropdown in the toolbar whenever rows are selected. The button appears to the left of the Filter button and disappears when nothing is selected.

```tsx
import type { GridAction } from "@/components/data-grid/dataverse-grid";

const actions: GridAction<Zap_investmentrecords>[] = [
  {
    label: "Single action",
    selectionMode: "single",       // only shown when exactly 1 row is selected
    onAction: (rows, clearSelection) => {
      console.log("Act on", rows[0]);
      clearSelection();            // call when you want to reset row selection
    },
  },
  {
    label: "Multiple action",
    selectionMode: "multiple",     // only shown when 2+ rows are selected
    onAction: (rows, clearSelection) => {
      console.log("Act on", rows.length, "records");
      clearSelection();
    },
  },
  {
    label: "Any action",
    selectionMode: "any",          // shown for any selection (default if omitted)
    onAction: (rows, clearSelection) => {
      console.log(rows);
      // omit clearSelection() call to keep rows selected after the action
    },
  },
];

<DataverseGrid<Zap_investmentrecords>
  title="Active Investment Record"
  actions={actions}
  config={{ ... }}
/>
```

### `GridAction<TData>` fields

| Field | Required | Notes |
|-------|----------|-------|
| `label` | yes | Text shown in the dropdown item |
| `onAction` | yes | Called with `(rows, clearSelection)` — call `clearSelection()` to reset row selection |
| `selectionMode` | no | `"single"` \| `"multiple"` \| `"any"` (default: `"any"`) |

### Rules
- Define the `actions` array **outside** the component or with `useMemo` — do not inline it in JSX to avoid unnecessary re-renders
- `selectionMode: "single"` — action is only visible when exactly 1 row is selected
- `selectionMode: "multiple"` — action is only visible when 2+ rows are selected
- `selectionMode: "any"` — action is visible for any non-zero selection (default when omitted)
- The dropdown uses `modal={false}` and suppresses focus-return so that closing it without selecting an action does **not** clear the row selection

## Column rules

Every filterable/sortable column needs:

1. `accessorKey` matching the model field name (OData field name)
2. `meta.label` — human label for filter/sort/view menus
3. `meta.cell.variant` — drives cell editor and filter operators (see [columns.md](columns.md))
4. `filterFn: getFilterFn()` — required for server-side filtering UI (except columns with `enableColumnFilter: false`)

**Display formatting** is separate from editing: add a custom `cell` renderer for currency, percentages, enum labels, etc. Keep `meta.cell.variant` as the underlying type.

**Lookup/display-only fields** (e.g. `owneridname`): set `enableSorting: false` and `enableColumnFilter: false`.

## Editing

Editing requires all of:

- `readOnly: false` in config
- Generated service exposes `update(id, changedFields)`
- Column fields use `accessorKey` so `useDataverseGrid` can detect updatable fields
- Separate `queryKey` when toggling read-only vs editable (avoids stale cache)

Edits are optimistic: cache patches immediately, then `service.update` runs per changed row with toast feedback.

## Server-side sort & filter

Sorting and filtering are **server-side** (`manualSorting: true`, `manualFiltering: true`). UI state is translated to OData in `src/components/data-grid/dataverse-grid/lib/odata-filters.ts`. Column `meta.cell.variant` determines how filter values are formatted (string vs number vs date vs option set).

Do not add client-side `getSortedRowModel` / `getFilteredRowModel` overrides in service grids.

## Layout

Page containers must allow the grid to shrink and scroll:

```tsx
<div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
  <DataverseGrid className="flex-1 min-h-0" config={...} />
</div>
```

## Built-in toolbar features

`DataverseGridToolbar` provides filter menu, sort menu, row height, column visibility, record count, and selection badge. No extra wiring needed.

Keyboard search: `Cmd/Ctrl+F` (enabled via `enableSearch: true` in `useDataverseGrid`).

## Additional resources

- Column variants and patterns: [columns.md](columns.md)
- Full example implementations: [examples.md](examples.md)
- File map, cell variants, OData details: [reference.md](reference.md)

## Anti-patterns

- Do not edit files under `src/generated/` — use generated models, enums, and services
- Do not omit `filterFn: getFilterFn()` on filterable columns
- Do not use display labels as `accessorKey` — always use the OData/model field name
- Do not reuse the same `queryKey` for read-only and editable modes
- Do not put entity columns or configs in `src/components/data-grid/` — use `src/features/{entity}/`
