import { nextJsConfig } from "@portfolio/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // public/ holds static assets (incl. the design-source HTML/JS prototype for
  // the presentation deck); it is not application source and must not be linted.
  { ignores: ["public/**"] },
  ...nextJsConfig,
];
