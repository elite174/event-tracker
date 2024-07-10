import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src/lib",
      exclude: ["**/*.test.ts"],
    }),
  ],
  build: {
    target: "esnext",
    lib: {
      entry: "src/lib/event-tracker.ts",
      name: "event-tracker",
      fileName: "index",
      formats: ["es"],
    },
    emptyOutDir: true,
    outDir: "dist",
    minify: false,
  },
});
