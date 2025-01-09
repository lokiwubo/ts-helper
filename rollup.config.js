import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        // 确保解析模块
        preferBuiltins: true, // 确保 lodash 不被解析为内置模块
      }),
      commonjs({
        // 将 CommonJS 模块转换为 ES6 模块
        include: /node_modules/, // 确保 node_modules 中的模块也被处理
      }),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      terser({
        compress: true, // 启用压缩
        mangle: true, // 启用混淆
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
