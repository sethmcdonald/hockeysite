const fs = require("fs");
const path = require("path");

function ensureWebPrismaClient(workspaceRoot = path.resolve(__dirname, "..", "..", "..")) {
  const sourceDir = path.join(workspaceRoot, "packages", "db", "node_modules", ".prisma", "client");
  const appNodeModulesDir = path.join(workspaceRoot, "apps", "web", "node_modules");
  const targetParentDir = path.join(appNodeModulesDir, ".prisma");
  const targetDir = path.join(targetParentDir, "client");

  if (!fs.existsSync(sourceDir) || !fs.existsSync(appNodeModulesDir)) {
    return;
  }

  fs.mkdirSync(targetParentDir, { recursive: true });

  if (fs.existsSync(targetDir)) {
    const enginePath = path.join(targetDir, "query_engine-windows.dll.node");

    if (fs.existsSync(enginePath)) {
      return;
    }

    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.symlinkSync(sourceDir, targetDir, "junction");
}

if (require.main === module) {
  ensureWebPrismaClient();
}

module.exports = {
  ensureWebPrismaClient
};
