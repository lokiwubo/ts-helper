import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      // terser({
      //   compress: true, // 启用压缩
      //   mangle: true, // 启用混淆
      // }),
    ],
    external: ["lodash"],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts.default()],
  },
];
