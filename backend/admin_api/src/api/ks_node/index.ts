import { Pool } from "pg";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  CreateKSNodeRequest,
  GetAllKSNodeResponse,
  CreateKSNodeResponse,
  DeactivateKSNodeRequest,
  DeactivateKSNodeResponse,
  GetKSNodeByIdRequest,
  GetKSNodeByIdResponse,
  UpdateKSNodeRequest,
  UpdateKSNodeResponse,
  ActivateKSNodeRequest,
  ActivateKSNodeResponse,
  DeleteKSNodeRequest,
  DeleteKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import {
  getAllKSNodesWithHealthCheck,
  getKSNodeById as getKSNodeByIdFromPG,
  insertKSNode,
  updateKSNodeStatus,
  updateKSNodeInfo,
  deleteKSNodeById,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import type { KSNodeStatus } from "@oko-wallet-types/tss";
import { processKSNodeHealthChecks } from "@oko-wallet/ks-node-health";
import { createAuditLog } from "@oko-wallet-admin-api/utils/audit";
import type { AuditContext } from "@oko-wallet-admin-api/utils/audit";

export async function getAllKSNodes(
  db: Pool,
): Promise<OkoApiResponse<GetAllKSNodeResponse>> {
  try {
    const getAllKSNodesRes = await getAllKSNodesWithHealthCheck(db);
    if (getAllKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get all ksNodes: ${getAllKSNodesRes.err}`,
      };
    }

    const ksNodes = getAllKSNodesRes.data;

    return {
      success: true,
      data: { ksNodes },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get ksNodes, err: ${error}`,
    };
  }
}

export async function getKSNodeById(
  db: Pool,
  body: GetKSNodeByIdRequest,
): Promise<OkoApiResponse<GetKSNodeByIdResponse>> {
  try {
    const getKSNodeRes = await getKSNodeByIdFromPG(db, body.node_id);
    if (getKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get ksNode: ${getKSNodeRes.err}`,
      };
    }

    if (getKSNodeRes.data === null) {
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    return {
      success: true,
      data: { ksNode: getKSNodeRes.data },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get ksNode: err: ${err}`,
    };
  }
}

export async function createKSNode(
  db: Pool,
  body: CreateKSNodeRequest,
  auditContext?: AuditContext,
): Promise<OkoApiResponse<CreateKSNodeResponse>> {
  try {
    const { node_name, server_url } = body;

    if (!node_name || !server_url) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "create",
          "node",
          undefined,
          undefined,
          { node_name, server_url },
          "denied",
          "node_name and server_url are required",
        );
      }
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "node_name and server_url are required",
      };
    }

    const insertKSNodeRes = await insertKSNode(db, node_name, server_url);
    if (insertKSNodeRes.success === false) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "create",
          "node",
          undefined,
          undefined,
          { node_name, server_url },
          "failure",
          `Failed to create ksNode: ${insertKSNodeRes.err}`,
        );
      }
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to create ksNode: ${insertKSNodeRes.err}`,
      };
    }

    const node_id = insertKSNodeRes.data.node_id;

    // trigger KS node health check
    processKSNodeHealthChecks(db);

    if (auditContext) {
      await createAuditLog(
        auditContext,
        "create",
        "node",
        node_id,
        [
          { field: "node_name", from: null, to: node_name },
          { field: "server_url", from: null, to: server_url },
          { field: "status", from: null, to: "ACTIVE" },
        ],
        { node_name, server_url },
        "success",
      );
    }

    return {
      success: true,
      data: { node_id },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to create ksNode, err: ${err}`,
    };
  }
}

export async function deactivateKSNode(
  db: Pool,
  body: DeactivateKSNodeRequest,
  auditContext?: AuditContext,
): Promise<OkoApiResponse<DeactivateKSNodeResponse>> {
  try {
    const getKSNodeRes = await getKSNodeByIdFromPG(db, body.node_id);
    if (getKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get ksNode: ${getKSNodeRes.err}`,
      };
    }

    if (getKSNodeRes.data === null) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "deactivate",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "failure",
          `KSNode not found: ${body.node_id}`,
        );
      }
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    if (getKSNodeRes.data.status === "INACTIVE") {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "deactivate",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "denied",
          `KSNode already inactive: ${body.node_id}`,
        );
      }
      return {
        success: false,
        code: "KS_NODE_ALREADY_INACTIVE",
        msg: `KSNode already inactive: ${body.node_id}`,
      };
    }

    const updateKSNodeStatusRes = await updateKSNodeStatus(
      db,
      body.node_id,
      "INACTIVE" as KSNodeStatus,
    );
    if (updateKSNodeStatusRes.success === false) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "deactivate",
          "ks_node",
          body.node_id,
          [{ field: "status", from: getKSNodeRes.data.status, to: "INACTIVE" }],
          undefined,
          "failure",
          `Failed to deactivate ksNode: ${updateKSNodeStatusRes.err}`,
        );
      }
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to deactivate ksNode: ${updateKSNodeStatusRes.err}`,
      };
    }

    if (auditContext) {
      await createAuditLog(
        auditContext,
        "disable",
        "node",
        body.node_id,
        [{ field: "status", from: getKSNodeRes.data.status, to: "INACTIVE" }],
        { node_id: body.node_id },
        "success",
      );
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to deactivate ksNode, err: ${err}`,
    };
  }
}

export async function activateKSNode(
  db: Pool,
  body: ActivateKSNodeRequest,
  auditContext?: AuditContext,
): Promise<OkoApiResponse<ActivateKSNodeResponse>> {
  try {
    const getKSNodeRes = await getKSNodeByIdFromPG(db, body.node_id);
    if (getKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get ksNode: ${getKSNodeRes.err}`,
      };
    }

    if (getKSNodeRes.data === null) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "activate",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "failure",
          `KSNode not found: ${body.node_id}`,
        );
      }
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    if (getKSNodeRes.data.status === "ACTIVE") {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "activate",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "denied",
          `KSNode already active: ${body.node_id}`,
        );
      }
      return {
        success: false,
        code: "KS_NODE_ALREADY_ACTIVE",
        msg: `KSNode already active: ${body.node_id}`,
      };
    }

    const updateKSNodeStatusRes = await updateKSNodeStatus(
      db,
      body.node_id,
      "ACTIVE" as KSNodeStatus,
    );
    if (updateKSNodeStatusRes.success === false) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "activate",
          "ks_node",
          body.node_id,
          [{ field: "status", from: getKSNodeRes.data.status, to: "ACTIVE" }],
          undefined,
          "failure",
          `Failed to activate ksNode: ${updateKSNodeStatusRes.err}`,
        );
      }
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to activate ksNode: ${updateKSNodeStatusRes.err}`,
      };
    }

    if (auditContext) {
      await createAuditLog(
        auditContext,
        "enable",
        "node",
        body.node_id,
        [{ field: "status", from: getKSNodeRes.data.status, to: "ACTIVE" }],
        { node_id: body.node_id },
        "success",
      );
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to activate ksNode, err: ${err}`,
    };
  }
}

export async function updateKSNode(
  db: Pool,
  body: UpdateKSNodeRequest,
  auditContext?: AuditContext,
): Promise<OkoApiResponse<UpdateKSNodeResponse>> {
  try {
    const { node_id, server_url } = body;

    if (!node_id || !server_url) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "update",
          "ks_node",
          node_id,
          undefined,
          undefined,
          "denied",
          "node_id and server_url are required",
        );
      }
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "node_id and server_url are required",
      };
    }

    // Get current node info for audit trail
    const getCurrentNodeRes = await getKSNodeByIdFromPG(db, node_id);
    const oldServerUrl =
      getCurrentNodeRes.success && getCurrentNodeRes.data
        ? getCurrentNodeRes.data.server_url
        : undefined;

    const updateKSNodeRes = await updateKSNodeInfo(db, node_id, server_url);
    if (updateKSNodeRes.success === false) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "update",
          "ks_node",
          node_id,
          undefined,
          undefined,
          "failure",
          `Failed to update ksNode: ${updateKSNodeRes.err}`,
        );
      }
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to update ksNode: ${updateKSNodeRes.err}`,
      };
    }

    if (auditContext) {
      await createAuditLog(
        auditContext,
        "update",
        "node",
        node_id,
        [{ field: "server_url", from: oldServerUrl, to: server_url }],
        { node_id, server_url },
        "success",
      );
    }

    return {
      success: true,
      data: { node_id },
    };
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to update ksNode: ${err}`,
    };
  }
}

export async function deleteKSNode(
  db: Pool,
  body: DeleteKSNodeRequest,
  auditContext?: AuditContext,
): Promise<OkoApiResponse<DeleteKSNodeResponse>> {
  try {
    const getKSNodeRes = await getKSNodeByIdFromPG(db, body.node_id);
    if (getKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get ksNode: ${getKSNodeRes.err}`,
      };
    }

    if (getKSNodeRes.data === null) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "delete",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "failure",
          `KSNode not found: ${body.node_id}`,
        );
      }
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    const deleteRes = await deleteKSNodeById(db, body.node_id);
    if (deleteRes.success === false) {
      if (auditContext) {
        await createAuditLog(
          auditContext,
          "delete",
          "ks_node",
          body.node_id,
          undefined,
          undefined,
          "failure",
          `Failed to delete ksNode: ${deleteRes.err}`,
        );
      }
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to delete ksNode: ${deleteRes.err}`,
      };
    }

    if (auditContext) {
      await createAuditLog(
        auditContext,
        "delete",
        "node",
        body.node_id,
        [{ field: "deleted_at", from: null, to: new Date().toISOString() }],
        { node_id: body.node_id },
        "success",
      );
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to delete ksNode: ${err}`,
    };
  }
}
