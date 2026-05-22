---
name: data-grid
description: >-
  Build and configure Power Platform entity grids using ServiceDataGrid, column
  definitions, and useServiceDataGrid. Use when adding a new entity grid page,
  defining columns, enabling editing, sorting, filtering, or infinite scroll
  for tabular data in this project.
---

# Data Grid

This project wraps a DiceUI-style spreadsheet grid with Power Platform services. The standard path is **ServiceDataGrid** — do not wire `useDataGrid` + React Query manually unless building a non-service grid.

## Architecture

```
Page (src/features/{entity}/)
  └─ EntityDataGrid (features/{entity}/components/data-grid.tsx)
       └─ <ServiceDataGrid config={...} />  (shared, src/components/data-grid/)
            └─ useServiceDataGrid(config)
                 ├─ useInfiniteQuery → service.getAll (OData filter/sort/skipToken)
                 └─ useDataGrid → <DataGrid /> (virtualized cells, keyboard nav, search)
```

| Layer | Location | Role |
|-------|----------|------|
| Page | `src/features/{entity}/*Page.tsx` | Compose feature grid + page chrome |
| Entity grid | `src/features/{entity}/components/data-grid.tsx` | Wires `ServiceDataGrid` config for one entity |
| Columns | `src/features/{entity}/components/columns.tsx` | TanStack `ColumnDef[]` for that entity |
| Shared grid | `src/components/data-grid/` | Reusable grid shell, cells, menus, toolbar |
| Hook | `src/hooks/use-service-data-grid.ts` | React Query + OData + edit persistence |
| Types | `src/types/service-data-grid.ts` | `ServiceDataGridConfig`, `DataService` |
| Filters | `src/lib/odata-filters.ts` | Sort/filter state → OData |

**Do not** put entity-specific columns or grid configs inside `src/components/data-grid/`. That folder is shared infrastructure only.

## Quick start — new entity grid

```
- [ ] 1. Create feature folder: src/features/{entity}/components/
- [ ] 2. Add columns.tsx with ColumnDef[] exported as `columns`
- [ ] 3. Add data-grid.tsx wrapping ServiceDataGrid with entity config
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
    ├── data-grid.tsx        # InvestmentDataGrid → ServiceDataGrid
    └── grid-mode-toggle.tsx # Feature-specific UI (optional)
```

**Entity data grid** (`src/features/investment/components/data-grid.tsx`):

```tsx
import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

import { columns } from "./columns";

export function InvestmentDataGrid({ readOnly = true }: { readOnly?: boolean }) {
  return (
    <ServiceDataGrid<Zap_investmentrecords>
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

## ServiceDataGridConfig

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
- Column fields use `accessorKey` so `useServiceDataGrid` can detect updatable fields
- Separate `queryKey` when toggling read-only vs editable (avoids stale cache)

Edits are optimistic: cache patches immediately, then `service.update` runs per changed row with toast feedback.

## Server-side sort & filter

Sorting and filtering are **server-side** (`manualSorting: true`, `manualFiltering: true`). UI state is translated to OData in `src/lib/odata-filters.ts`. Column `meta.cell.variant` determines how filter values are formatted (string vs number vs date vs option set).

Do not add client-side `getSortedRowModel` / `getFilteredRowModel` overrides in service grids.

## Layout

Page containers must allow the grid to shrink and scroll:

```tsx
<div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
  <ServiceDataGrid className="flex-1 min-h-0" config={...} />
</div>
```

## Built-in toolbar features

`ServiceDataGridToolbar` provides filter menu, sort menu, row height, column visibility, record count, and selection badge. No extra wiring needed.

Keyboard search: `Cmd/Ctrl+F` (enabled via `enableSearch: true` in `useServiceDataGrid`).

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
