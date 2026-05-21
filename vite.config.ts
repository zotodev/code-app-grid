import path from "node:path";

import { powerApps } from "@microsoft/power-apps-vite/plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { consoleForwardPlugin } from "./plugins/console-forward-plugin";

export default defineConfig({
	plugins: [
		consoleForwardPlugin({
      // Enable console forwarding (default: true in dev mode)
      enabled: true,


      // Which console levels to forward (default: all)
      levels: ["log", "warn", "error", "info", "debug"],
    }),
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		powerApps(),
	],
	server: {
		port: 3000
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
