module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "import",
    "@typescript-eslint"
  ],
  rules: {
    "import/order": [
      "warn",
      {
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        },
        "groups": ["builtin", "external", "internal"],
        "newlines-between": "never",
      },
    ],
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
