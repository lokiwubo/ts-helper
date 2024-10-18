import alias from "@rollup/plugin-alias";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  plugins: [
    alias({
      entries: [{ find: "@", replacement: "src" }], // 配置别名
    }),
    typescript({
      tsconfig: "./tsconfig.json", // 指定tsconfig.json文件
      declaration: true, // 生成.d.ts声明文件
      declarationDir: "./dist/types", // 指定.d.ts文件的输出目录
    }),
  ],
  external: [],
};
