import { existsSync, readFileSync } from "fs";
import { defineConfig } from "drizzle-kit";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
    const isSingleQuoted = value.startsWith("'") && value.endsWith("'");
    if (isDoubleQuoted || isSingleQuoted) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, "../../.env"));

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Put it in the .env file in the resume-genie folder (the same folder as package.json).",
  );
}

export default defineConfig({
  // Relative glob with forward slashes. Absolute Windows paths break
  // drizzle-kit globs (this repo folder name contains `\r`).
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
