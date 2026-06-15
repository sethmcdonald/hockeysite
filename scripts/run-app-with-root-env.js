const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { ensureWebPrismaClient } = require("../packages/db/scripts/sync-prisma-client");

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1).trim());

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const workspaceRoot = path.resolve(__dirname, "..");
const envPath = path.join(workspaceRoot, ".env");

loadEnvFile(envPath);
ensureWebPrismaClient(workspaceRoot);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing command to run.");
  process.exit(1);
}

const result = spawnSync(args[0], args.slice(1), {
  cwd: workspaceRoot,
  env: process.env,
  stdio: "inherit",
  shell: true
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
