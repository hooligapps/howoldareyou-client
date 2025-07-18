import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/bundle.esm.js",
            format: "esm",
            sourcemap: true
        },
        {
            file: "dist/bundle.umd.js",
            format: "umd",
            name: "AgeVerifier",
            sourcemap: true
        }
    ],
    plugins: [resolve(), commonjs()]
};
