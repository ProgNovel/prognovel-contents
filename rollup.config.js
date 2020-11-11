import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";

const pkg = require("./package.json");

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: `.prognovel/index.ts`,
  output: ".prognovel/dist/main.js",
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: ".prognovel/**",
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // typescript({ useTsconfigDeclarationDir: true }),
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    babel({
      extensions,
      babelHelpers: "bundled",
      include: [".prognovel/**/*"],
    }),
  ],
};
