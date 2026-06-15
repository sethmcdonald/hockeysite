const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadEnvFile } = require("./load-env");

const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..", "..");
const envPath = path.join(workspaceRoot, ".env");
const pnpmRoot = path.join(workspaceRoot, "node_modules", ".pnpm");

loadEnvFile(envPath);
// Prisma can try to auto-install packages during generate or migrate.
// On this local setup we want to use the dependencies that are already installed.
process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = "1";

function findNodeModuleDir(prefix) {
  const packageName = prefix.replace(/\+/g, "/");
  const localPackagePath = path.join(packageRoot, "node_modules", packageName);

  if (fs.existsSync(localPackagePath)) {
    return path.join(packageRoot, "node_modules");
  }

  const workspacePackagePath = path.join(workspaceRoot, "node_modules", packageName);

  if (fs.existsSync(workspacePackagePath)) {
    return path.join(workspaceRoot, "node_modules");
  }

  if (!fs.existsSync(pnpmRoot)) {
    return null;
  }

  const match = fs
    .readdirSync(pnpmRoot)
    .find((entry) => entry === prefix || entry.startsWith(`${prefix}@`));

  if (!match) {
    return null;
  }

  return path.join(pnpmRoot, match, "node_modules");
}

const extraNodePaths = [
  findNodeModuleDir("@prisma+client"),
  findNodeModuleDir("@prisma+debug"),
  findNodeModuleDir("@prisma+engines"),
  findNodeModuleDir("@prisma+engines-version"),
  findNodeModuleDir("@prisma+fetch-engine"),
  findNodeModuleDir("@prisma+get-platform"),
  findNodeModuleDir("prisma"),
  path.join(pnpmRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
  path.join(packageRoot, "node_modules")
].filter(Boolean);

process.env.NODE_PATH = extraNodePaths.join(path.delimiter);

const prismaModuleRoot = findNodeModuleDir("prisma");

if (!prismaModuleRoot) {
  console.error("Could not locate the prisma package in node_modules.");
  process.exit(1);
}

const prismaEntrypoint = path.join(prismaModuleRoot, "prisma", "build", "index.js");
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing Prisma arguments.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [prismaEntrypoint, ...args], {
  stdio: "inherit",
  cwd: packageRoot,
  env: process.env
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
