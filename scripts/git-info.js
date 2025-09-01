// build-git-info.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
  const commitDate = execSync("git log -1 --format=%cd --date=iso")
    .toString()
    .trim();

  const envContent = `
NEXT_PUBLIC_GIT_COMMIT_ID=${commitHash}
NEXT_PUBLIC_GIT_COMMIT_TIME=${commitDate}
`;

  // 写入到项目根目录
  fs.writeFileSync(path.resolve(__dirname, "..", ".env.local"), envContent);

  console.log(`Git info written to .env.local`);
  console.log(`Commit ID: ${commitHash}`);
  console.log(`Commit Time: ${commitDate}`);
} catch (e) {
  console.error("Failed to get git info:", e.message);
}
