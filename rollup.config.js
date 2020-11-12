import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import { wasm } from "@rollup/plugin-wasm";
// import regenerator from "rollup-plugin-regenerator";
// import builtins from "rollup-plugin-node-builtins";
import sourcemap from "rollup-plugin-sourcemaps";

const pkg = require("./package.json");

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: "prognovel.ts",
  output: {
    file: ".prognovel/.dist/main.js",
    name: "prognovel-contents",
    format: "cjs",
    sourcemap: true,
  },
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ["sharp", "dessert-yaml-js", "wasm-frontmatter"],
  cache: true,
  watch: {
    include: ".prognovel/**",
  },
  plugins: [
    // builtins(),
    // regenerator(),
    json(),
    // typescript({ useTsconfigDeclarationDir: true }),
    wasm(),
    typescript(),
    commonjs(),
    sourcemap(),
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      preferBuiltins: true,
    }),
    babel({
      extensions,
      include: [".prognovel/**/*"],
      runtimeHelpers: true,
    }),
  ],
};
