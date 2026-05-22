type ManualChunks = (id: string) => string | undefined;

const vendorMatchers: Array<{ chunk: string; test: (id: string) => boolean }> = [
	{
		chunk: "react-vendor",
		test: (id) =>
			/node_modules\/(react-dom|react\/|scheduler\/)/.test(id),
	},
	{
		chunk: "tanstack-router",
		test: (id) =>
			id.includes("@tanstack/react-router") ||
			id.includes("@tanstack/router-core") ||
			id.includes("@tanstack/history"),
	},
	{
		chunk: "tanstack-query",
		test: (id) => id.includes("@tanstack/react-query"),
	},
	{
		chunk: "tanstack-table",
		test: (id) =>
			id.includes("@tanstack/react-table") ||
			id.includes("@tanstack/table-core") ||
			id.includes("@tanstack/react-virtual") ||
			id.includes("@tanstack/virtual-core"),
	},
	{
		chunk: "radix-vendor",
		test: (id) => id.includes("@radix-ui") || id.includes("/radix-ui/"),
	},
	{
		chunk: "dnd-vendor",
		test: (id) => id.includes("@dnd-kit"),
	},
	{
		chunk: "icons-vendor",
		test: (id) => id.includes("lucide-react"),
	},
	{
		chunk: "charts-vendor",
		test: (id) => id.includes("recharts") || id.includes("/d3-"),
	},
	{
		chunk: "date-vendor",
		test: (id) =>
			id.includes("date-fns") || id.includes("react-day-picker"),
	},
	{
		chunk: "motion-vendor",
		test: (id) => id.includes("/motion/") || id.includes("framer-motion"),
	},
	{
		chunk: "microsoft-vendor",
		test: (id) => id.includes("@microsoft/"),
	},
	{
		chunk: "cmdk-vendor",
		test: (id) => id.includes("/cmdk/"),
	},
	{
		chunk: "zod-vendor",
		test: (id) => id.includes("/zod/"),
	},
	{
		chunk: "base-ui-vendor",
		test: (id) => id.includes("@base-ui/"),
	},
	{
		chunk: "tanstack-misc",
		test: (id) => id.includes("@tanstack/"),
	},
];

const appMatchers: Array<{ chunk: string; test: (id: string) => boolean }> = [
	{
		chunk: "data-grid",
		test: (id) => id.includes("/src/components/data-grid/"),
	},
	{
		chunk: "generated",
		test: (id) => id.includes("/src/generated/"),
	},
];

export function createManualChunks(): ManualChunks {
	return (id) => {
		if (id.includes("node_modules")) {
			for (const { chunk, test } of vendorMatchers) {
				if (test(id)) return chunk;
			}
			return "vendor-misc";
		}

		for (const { chunk, test } of appMatchers) {
			if (test(id)) return chunk;
		}

		return undefined;
	};
}
