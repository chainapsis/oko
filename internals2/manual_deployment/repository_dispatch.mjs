/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";
import { Octokit } from "@octokit/core";

(async () => {
  try {
    const versions = (await $`git tag --points-at HEAD`).stdout
      .split(/\s/)
      .map((v) => v.trim())
      .filter((v) => !!v);

    for (const version of versions) {
      if (
        !version.startsWith("develop/v") &&
        !version.startsWith("release/v")
      ) {
        continue;
      }

      const semantic = semver.parse(
        version.replace("develop/v", "").replace("release/v", ""),
      );

      if (semantic) {
        const authKey = process.env["DEPLOYMENT_AUTH_KEY"];
        if (!authKey) {
          throw new Error("DEPLOYMENT_AUTH_KEY is not provided");
        }
        const owner = process.env["DEPLOYMENT_OWNER"];
        if (!owner) {
          throw new Error("DEPLOYMENT_OWNER is not provided");
        }
        const repo = process.env["DEPLOYMENT_REPO"];
        if (!repo) {
          throw new Error("DEPLOYMENT_REPO is not provided");
        }
        const eventType = process.env["DEPLOYMENT_EVENT_TYPE"];
        if (!eventType) {
          throw new Error("DEPLOYMENT_EVENT_TYPE is not provided");
        }

        const octokit = new Octokit({ auth: authKey });

        await octokit.request(`POST /repos/${owner}/${repo}/dispatches`, {
          event_type: eventType,
          client_payload: {
            ref: process.env["GITHUB_REF"],
            sha: process.env["GITHUB_SHA"],
            target_tag: version,
          },
        });
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
