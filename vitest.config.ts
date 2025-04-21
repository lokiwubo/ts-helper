import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist"],
    environment: "node",
    typecheck: {
      enabled: true,
      checker: "tsc", // 也可以使用 "vue-tsc" 等
    },
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    reporters: ["verbose", "html", "json"], // 三种输出方式，命令行、html、json
    outputFile: {
      json: "./test/dist/json-report.json",
      html: "./test/dist/index.html",
    },
    coverage: {
      enabled: true,
      reporter: ["text", "json", "html"],
    },
  },
});
