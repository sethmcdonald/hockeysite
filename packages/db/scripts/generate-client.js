const path = require("path");
const { spawnSync } = require("child_process");
const { ensureWebPrismaClient } = require("./sync-prisma-client");

const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..", "..");

const generateResult = spawnSync(
  process.execPath,
  [path.join(__dirname, "run-prisma.js"), "generate", "--schema", "prisma/schema.prisma"],
  {
    cwd: packageRoot,
    env: process.env,
    stdio: "inherit"
  }
);

if (generateResult.error) {
  console.error(generateResult.error);
  process.exit(1);
}

if ((generateResult.status ?? 1) !== 0) {
  process.exit(generateResult.status ?? 1);
}

ensureWebPrismaClient(workspaceRoot);
