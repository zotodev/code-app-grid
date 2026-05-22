# Data grid reference

## File map

```
src/
├── features/
│   ├── investment/
│   │   ├── InvestmentRecordsPage.tsx
│   │   └── components/
│   │       ├── columns.tsx              # Entity column defs
│   │       ├── data-grid.tsx            # InvestmentDataGrid → DataverseGrid
│   │       └── grid-mode-toggle.tsx     # Feature-specific UI
│   └── todos/
│       └── components/
│           ├── columns.tsx
│           └── data-grid.tsx            # TodosDataGrid → DataverseGrid
├── components/
│   └── data-grid/                       # All grid code in one module
│       ├── index.ts                     # getFilterFn, grid types
│       ├── data-grid.tsx                # Low-level virtualized grid UI
│       ├── data-grid-*.tsx              # Cells, menus, search, skeleton
│       ├── hooks/
│       │   ├── use-data-grid.ts         # DiceUI grid behavior
│       │   ├── use-cell-sync.ts
│       │   ├── use-badge-overflow.ts
│       │   └── use-debounced-callback.ts
│       ├── lib/
│       │   ├── data-grid.ts             # Grid utilities
│       │   └── data-grid-filters.ts     # Client filterFn + operators
│       ├── types/
│       │   └── data-grid.ts             # CellOpts, FilterValue, etc.
│       └── dataverse-grid/              # Power Platform / OData layer
│           ├── index.ts                 # DataverseGrid, GridAction, config
│           ├── DataverseGrid.tsx
│           ├── DataverseGridToolbar.tsx
│           ├── hooks/
│           │   └── use-dataverse-grid.ts
│           ├── types/
│           │   └── dataverse-grid-config.ts
│           └── lib/
│               └── odata-filters.ts
└── generated/
    ├── models/*Model.ts                 # Entity types + enums
    └── services/*Service.ts             # getAll, update, create, delete
```

## DataService interface

Any generated Power Platform service works if it satisfies:

```ts
interface DataService<T> {
  getAll(options?: IGetAllOptions): Promise<IOperationResult<T[]>>;
  update?(id: string, changedFields: Partial<T>): Promise<IOperationResult<T>>;
}
```

`IGetAllOptions` supports `maxPageSize`, `orderBy`, `filter`, `skipToken`.

## OData translation

| UI state | Function | OData |
|----------|----------|-------|
| `SortingState` | `sortingToOData()` | `$orderby` array |
| `ColumnFiltersState` | `filtersToOData()` | `$filter` string |

Filter shape (`FilterValue`):

```ts
{ operator: "contains", value: "acme" }
{ operator: "isBetween", value: 10, endValue: 100 }
{ operator: "isAnyOf", value: ["1", "2"] }
```

Variant → value formatting (in `odata-filters.ts`):

- `number`, `select` → unquoted numbers
- `date`, `datetime` → date strings
- text variants → quoted strings with escaped `'`

## useDataverseGrid return value

Spread into `<DataGrid />` via `DataverseGrid`:

| Field | Purpose |
|-------|---------|
| `table` | TanStack Table instance (toolbar menus) |
| `dataGridRef` | Scroll container ref (infinite scroll root) |
| `query` | React Query infinite query result |
| `data` | Flattened rows from all pages |
| `totalCount` | Total from first page `count` |
| `hasNextPage`, `fetchNextPage`, `isFetchingNextPage` | Pagination |
| `isLoading`, `isError`, `error` | Top-level states |
| `isSaving` | Update mutation pending |

## useDataGrid options (via useDataverseGrid)

These are set internally; override only if using `useDataGrid` standalone:

| Option | Default in service grid | Notes |
|--------|-------------------------|-------|
| `manualSorting` | `true` | Server-side |
| `manualFiltering` | `true` | Server-side |
| `enableSearch` | `true` | Cmd/Ctrl+F |
| `readOnly` | from config | Disables editing |
| `enableRowSelection` | from config | Checkbox column |
| `onDataChange` | wired to `service.update` | When not readOnly |

Additional standalone options: `onRowAdd`, `onRowsDelete`, `enablePaste`, `rowHeight`, `autoFocus`.

## Cell variant type (`CellOpts`)

Defined in `src/components/data-grid/types/data-grid.ts`:

```ts
| { variant: "short-text" }
| { variant: "long-text" }
| { variant: "number"; min?: number; max?: number; step?: number }
| { variant: "select"; options: CellSelectOption[] }
| { variant: "multi-select"; options: CellSelectOption[] }
| { variant: "checkbox" }
| { variant: "date" }
| { variant: "datetime" }
| { variant: "url" }
| { variant: "file"; maxFileSize?: number; maxFiles?: number; accept?: string; multiple?: boolean }
```

## ColumnMeta extension

TanStack `ColumnMeta` is augmented with:

```ts
interface ColumnMeta {
  label?: string;      // Shown in filter/sort/view menus
  cell?: CellOpts;     // Editor + filter variant
}
```

## Row selection column

When `enableRowSelection: true`, `getDataGridSelectColumn()` is prepended unless a column with `id: "select"` already exists. In read-only mode it shows row numbers; in editable mode it shows checkboxes.

## Edit persistence flow

1. User edits cell → `useDataGrid` calls `onDataChange(newData)`
2. `collectRowUpdates()` diffs old vs new by `accessorKey` fields
3. Optimistic cache patch via `queryClient.setQueryData`
4. `service.update(id, changedFields)` per changed row
5. `invalidateQueries` on settle; toast on success/error

Only fields with `accessorKey` (or `id`) in column defs are considered updatable.

## UI states (DataverseGrid)

| State | UI |
|-------|-----|
| `isLoading` | `DataGridSkeleton` |
| `isError` | Error card + Retry (`query.refetch()`) |
| Empty (no rows, no next page) | Toolbar + dashed empty state |
| Normal | Toolbar + DataGrid + "Loading more…" footer |

## Keyboard & interaction (built-in)

- Arrow keys, Tab, Enter — cell navigation
- Cmd/Ctrl+F — search
- Copy/paste — TSV cell paste (when not readOnly)
- Shift+click — range row selection
- Context menu — copy, cut, paste, clear

See `data-grid-keyboard-shortcuts.tsx` for the full list.

## Generated code conventions

| Artifact | Import path |
|----------|-------------|
| Model type | `@/generated/models/{Entity}Model` |
| Enum maps | Same file, e.g. `Zap_todo1szap_status` |
| Service | `@/generated/services/{Entity}Service` |
| Primary key | On model interface, e.g. `zap_todo1id` |

Never modify `src/generated/` — regenerate from Power Platform tooling instead.
