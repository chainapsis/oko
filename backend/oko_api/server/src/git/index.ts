import { execSync } from "node:child_process";

export function getCommitHash() {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch (err) {
    console.warn("Git failed");
    return "";
  }
}
