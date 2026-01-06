import { execSync } from "child_process";

import { logger } from "@oko-wallet-ksn-server/logger";

export function getGitCommitHash(): string | null {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    return commitHash;
  } catch (err: any) {
    logger.error("Error getting Git commit hash: %s", err.message);

    return null;
  }
}
