import { Pool } from "pg";
import type { OkoApiResponse } from "@oko-wallet/ewallet-types/api_response";
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
} from "@oko-wallet/ewallet-types/admin";
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
      msg: `Failed to get ksNodes: ${error instanceof Error ? error.message : String(error)}`,
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
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function createKSNode(
  db: Pool,
  body: CreateKSNodeRequest,
): Promise<OkoApiResponse<CreateKSNodeResponse>> {
  try {
    const { node_name, server_url } = body;

    if (!node_name || !server_url) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "node_name and server_url are required",
      };
    }

    const insertKSNodeRes = await insertKSNode(db, node_name, server_url);
    if (insertKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to create ksNode: ${insertKSNodeRes.err}`,
      };
    }

    const node_id = insertKSNodeRes.data.node_id;

    // trigger KS node health check
    processKSNodeHealthChecks(db);

    return {
      success: true,
      data: { node_id },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to create ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function deactivateKSNode(
  db: Pool,
  body: DeactivateKSNodeRequest,
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
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    if (getKSNodeRes.data.status === "INACTIVE") {
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
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to deactivate ksNode: ${updateKSNodeStatusRes.err}`,
      };
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to deactivate ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function activateKSNode(
  db: Pool,
  body: ActivateKSNodeRequest,
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
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    if (getKSNodeRes.data.status === "ACTIVE") {
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
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to activate ksNode: ${updateKSNodeStatusRes.err}`,
      };
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to activate ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function updateKSNode(
  db: Pool,
  body: UpdateKSNodeRequest,
): Promise<OkoApiResponse<UpdateKSNodeResponse>> {
  try {
    const { node_id, server_url } = body;

    if (!node_id || !server_url) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "node_id and server_url are required",
      };
    }

    const updateKSNodeRes = await updateKSNodeInfo(db, node_id, server_url);
    if (updateKSNodeRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to update ksNode: ${updateKSNodeRes.err}`,
      };
    }

    return {
      success: true,
      data: { node_id },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to update ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function deleteKSNode(
  db: Pool,
  body: DeleteKSNodeRequest,
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
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: `KSNode not found: ${body.node_id}`,
      };
    }

    const deleteRes = await deleteKSNodeById(db, body.node_id);
    if (deleteRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to delete ksNode: ${deleteRes.err}`,
      };
    }

    return {
      success: true,
      data: { node_id: body.node_id },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to delete ksNode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
