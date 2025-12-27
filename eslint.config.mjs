import next from "eslint-plugin-next";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  next.configs["core-web-vitals"],
  {
    rules: {
      // You can customize eslint rules here if needed
    },
  },
];
