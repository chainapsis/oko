import type { Pool, PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import {
  createKSNodeHealthChecks,
  getAllKSNodes,
  selectKSNodeHealthChecks,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import type { KSNodeHealthCheckStatus } from "@oko-wallet/oko-types/tss";

export async function healthCheckKSNode(
  db: Pool | PoolClient,
): Promise<Result<number, string>> {
  const getAllKSNodesRes = await getAllKSNodes(db);
  if (getAllKSNodesRes.success === false) {
    return {
      success: false,
      err: `Failed to get all ksNodes: ${getAllKSNodesRes.err}`,
    };
  }

  const nodes = getAllKSNodesRes.data;
  const healthCheckResults: {
    nodeId: string;
    status: KSNodeHealthCheckStatus;
  }[] = await Promise.all(
    nodes.map(async (node) => {
      const isHealthy = await requestKSNodeHealthCheck(node.server_url);
      return {
        nodeId: node.node_id,
        status: isHealthy ? "HEALTHY" : "UNHEALTHY",
      };
    }),
  );

  const createKSNodeHealthChecksRes = await createKSNodeHealthChecks(
    db,
    healthCheckResults,
  );
  if (createKSNodeHealthChecksRes.success === false) {
    return {
      success: false,
      err: `Failed to create ksNode health checks: ${createKSNodeHealthChecksRes.err}`,
    };
  }

  return {
    success: true,
    data: healthCheckResults.length,
  };
}

async function requestKSNodeHealthCheck(cvEndpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${cvEndpoint}/`);
    if (response.status !== 200) {
      return false;
    }
    const data = await response.text();
    return data === "Ok";
  } catch {
    return false;
  }
}

export async function getKSNHealthChecks(
  db: Pool | PoolClient,
): Promise<Result<number, string>> {
  const getAllKSNodesRes = await selectKSNodeHealthChecks(db);
  if (getAllKSNodesRes.success === false) {
    return {
      success: false,
      err: `Failed to get all ksNodes: ${getAllKSNodesRes.err}`,
    };
  }

  const nodes = getAllKSNodesRes.data;
  const healthCheckResults: {
    nodeId: string;
    status: KSNodeHealthCheckStatus;
  }[] = await Promise.all(
    nodes.map(async (node) => {
      return {
        nodeId: "",
        status: "HEALTHY",
      };
    }),
  );

  const createKSNodeHealthChecksRes = await createKSNodeHealthChecks(
    db,
    healthCheckResults,
  );
  if (createKSNodeHealthChecksRes.success === false) {
    return {
      success: false,
      err: `Failed to create ksNode health checks: ${createKSNodeHealthChecksRes.err}`,
    };
  }

  return {
    success: true,
    data: healthCheckResults.length,
  };
}
