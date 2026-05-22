# Data grid examples

Runnable references in this repo are noted where they exist. Other patterns are copy-paste templates.

---

## 1. Read-only entity grid (default)

**Reference:** `src/features/investment/`, route `/`

```tsx
// src/features/investment/components/data-grid.tsx
import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import type { Zap_investmentrecords } from "@/generated/models/Zap_investmentrecordsModel";
import { Zap_investmentrecordsService } from "@/generated/services/Zap_investmentrecordsService";

import { columns } from "./columns";

export function InvestmentDataGrid() {
  return (
    <ServiceDataGrid<Zap_investmentrecords>
      config={{
        queryKey: "investments",
        service: Zap_investmentrecordsService,
        columns,
        idField: "zap_investmentrecordid",
        defaultSort: [{ id: "createdon", desc: true }],
      }}
    />
  );
}
```

```tsx
// src/features/investment/InvestmentRecordsPage.tsx
import { InvestmentDataGrid } from "@/features/investment/components/data-grid";

export function InvestmentRecordsPage() {
  return (
    <div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
      <InvestmentDataGrid />
    </div>
  );
}
```

---

## 2. Editable grid with route toggle

**Reference:** `src/routes/editable.tsx`, `src/features/investment/components/grid-mode-toggle.tsx`

Pass `readOnly` into the feature data grid. Use a distinct `queryKey`:

```tsx
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

Route for editable mode:

```tsx
// src/routes/editable.tsx
function EditablePage() {
  return <InvestmentRecordsPage readOnly={false} />;
}
```

---

## 3. Second entity (Todos)

**Reference:** `src/features/todos/components/`

```tsx
// src/features/todos/components/data-grid.tsx
import { ServiceDataGrid } from "@/components/data-grid/ServiceDataGrid";
import type { Zap_todo1s } from "@/generated/models/Zap_todo1sModel";
import { Zap_todo1sService } from "@/generated/services/Zap_todo1sService";

import { columns } from "./columns";

export function TodosDataGrid() {
  return (
    <ServiceDataGrid<Zap_todo1s>
      config={{
        queryKey: "todos",
        service: Zap_todo1sService,
        columns,
        idField: "zap_todo1id",
        defaultSort: [{ id: "zap_duedate", desc: false }],
      }}
    />
  );
}
```

```tsx
// src/features/todos/TodosPage.tsx
import { TodosDataGrid } from "@/features/todos/components/data-grid";

export function TodosPage() {
  return (
    <div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
      <TodosDataGrid />
    </div>
  );
}
```

Wire route:

```tsx
// src/routes/todos.tsx
import { createFileRoute } from "@tanstack/react-router";
import { TodosPage } from "@/features/todos/TodosPage";

export const Route = createFileRoute("/todos")({
  component: TodosPage,
});
```

---

## 4. Custom page size

Add to the feature `data-grid.tsx` config:

```tsx
config={{
  queryKey: "investments-large",
  service: Zap_investmentrecordsService,
  columns,
  idField: "zap_investmentrecordid",
  pageSize: 25,
}}
```

Infinite scroll loads the next page when the sentinel enters the viewport (300px root margin).

---

## 5. Disable row selection

```tsx
config={{
  queryKey: "investments-no-select",
  service: Zap_investmentrecordsService,
  columns,
  idField: "zap_investmentrecordid",
  enableRowSelection: false,
}}
```

---

## 6. Default multi-column sort

`defaultSort` maps directly to OData `$orderby` (first entry = primary sort):

```tsx
defaultSort: [
  { id: "zap_status", desc: false },
  { id: "createdon", desc: true },
],
// → "zap_status asc, createdon desc"
```

Column `id` must match `accessorKey` (or explicit `id` on the column def).

---

## 7. Minimal column set

Start with a few columns in `columns.tsx`, expand later:

```tsx
export const columns: ColumnDef<Zap_todo1s, unknown>[] = [
  {
    accessorKey: "zap_taskname",
    header: "Task",
    size: 240,
    meta: { label: "Task Name", cell: { variant: "short-text" } },
    filterFn: getFilterFn(),
  },
  // ...
];
```

---

## 8. Page with mode toggle + grid

**Reference:** `src/features/investment/InvestmentRecordsPage.tsx`

```tsx
<div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
  <GridModeToggle />
  <InvestmentDataGrid readOnly={readOnly} />
</div>
```

`GridModeToggle` links between `/` (read-only) and `/editable`.

---

## 9. Using the hook directly (advanced)

Prefer feature `data-grid.tsx` wrapping `<ServiceDataGrid>`. Use `useServiceDataGrid` only when you need custom layout around the grid shell:

```tsx
const { table, data, isLoading, ...dataGridProps } = useServiceDataGrid(config);

if (isLoading) return <DataGridSkeleton>...</DataGridSkeleton>;

return (
  <>
    <CustomHeader total={data.length} />
    <DataGrid {...dataGridProps} className="flex-1 min-h-0" />
  </>
);
```

Do not reimplement OData translation or infinite query logic.

---

## 10. Checklist for new grid PR

```
- [ ] Feature folder created under src/features/{entity}/
- [ ] columns.tsx uses generated model type, exports `columns`
- [ ] data-grid.tsx wraps ServiceDataGrid with entity config
- [ ] Page imports from feature folder, not src/components/data-grid/
- [ ] idField is the entity primary key
- [ ] All filterable columns have filterFn: getFilterFn()
- [ ] Enum columns use String(key) for option values
- [ ] Page container has min-h-0 flex layout
- [ ] queryKey is unique per grid variant
- [ ] Route registered if new page
- [ ] Editable mode tested only when service.update exists
```
