import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  { files: ["lib/art.ts"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
];

export default config;
