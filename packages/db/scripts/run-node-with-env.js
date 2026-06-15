const path = require("path");
const { spawnSync } = require("child_process");
const { loadEnvFile } = require("./load-env");

const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..", "..");
const envPath = path.join(workspaceRoot, ".env");

loadEnvFile(envPath);

const scriptPath = process.argv[2];
const scriptArgs = process.argv.slice(3);

if (!scriptPath) {
  console.error("Missing script path.");
  process.exit(1);
}

const resolvedScriptPath = path.resolve(packageRoot, scriptPath);
const result = spawnSync(process.execPath, [resolvedScriptPath, ...scriptArgs], {
  stdio: "inherit",
  cwd: packageRoot,
  env: process.env
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
