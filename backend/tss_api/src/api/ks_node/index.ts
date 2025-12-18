import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { KeyShareNode } from "@oko-wallet-types/tss";
import type { AuthType } from "@oko-wallet/oko-types/auth";

import {
  requestCheckKeyShare,
  requestCheckKeyShareEd25519,
} from "@oko-wallet-tss-api/requests";

export async function checkKeyShareFromKSNodes(
  userEmail: string,
  publicKey: Bytes33,
  targetKSNodes: KeyShareNode[],
  auth_type: AuthType,
): Promise<OkoApiResponse<{ nodeIds: string[] }>> {
  try {
    const nodeServerUrls: string[] = [];
    const nodeIds: string[] = [];

    targetKSNodes.forEach((ksNode) => {
      nodeServerUrls.push(ksNode.server_url);
      nodeIds.push(ksNode.node_id);
    });

    const results = await Promise.allSettled(
      nodeServerUrls.map(async (nodeServerUrl) => {
        const res = await requestCheckKeyShare(
          nodeServerUrl,
          userEmail,
          publicKey,
          auth_type,
        );

        if (res.success === false) {
          return {
            success: false,
            code: res.code,
            err: res.msg,
          };
        }

        return {
          success: true,
          data: res.data,
        };
      }),
    );

    const errorResults = results
      .map((result, index) => {
        return {
          index,
          resContent: result,
        };
      })
      .filter(
        (result) =>
          result.resContent.status === "rejected" ||
          result.resContent.value.success === false ||
          (result.resContent.value.data &&
            result.resContent.value.data.exists === false),
      );

    if (errorResults.length > 0) {
      const errArr = [];
      for (let err of errorResults) {
        const comm = targetKSNodes[err.index];

        if (err.resContent.status === "rejected") {
          errArr.push(`name: ${comm.node_name}, err: ${err.resContent.reason}`);
        } else if (err.resContent.value.success === false) {
          errArr.push(
            `name: ${comm.node_name}, err: ${err.resContent.value.err}`,
          );
        } else if (
          err.resContent.value.data &&
          err.resContent.value.data.exists === false
        ) {
          errArr.push(`name: ${comm.node_name}, err: keyshare does not exist`);
        } else {
          errArr.push(
            `name: ${comm.node_name}, err: ${err.resContent.value.err}`,
          );
        }
      }

      const errMsg = errArr.join("\n");

      return {
        success: false,
        code: "KEYSHARE_NODE_INSUFFICIENT",
        msg: errMsg,
      };
    }

    return {
      success: true,
      data: {
        nodeIds,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkKeyShareFromKSNodesEd25519(
  userEmail: string,
  publicKey: Bytes32,
  targetKSNodes: KeyShareNode[],
): Promise<OkoApiResponse<{ nodeIds: string[] }>> {
  try {
    const nodeServerUrls: string[] = [];
    const nodeIds: string[] = [];

    targetKSNodes.forEach((ksNode) => {
      nodeServerUrls.push(ksNode.server_url);
      nodeIds.push(ksNode.node_id);
    });

    const results = await Promise.allSettled(
      nodeServerUrls.map(async (nodeServerUrl) => {
        const res = await requestCheckKeyShareEd25519(
          nodeServerUrl,
          userEmail,
          publicKey,
        );

        if (res.success === false) {
          return {
            success: false,
            code: res.code,
            err: res.msg,
          };
        }

        return {
          success: true,
          data: res.data,
        };
      }),
    );

    const errorResults = results
      .map((result, index) => {
        return {
          index,
          resContent: result,
        };
      })
      .filter(
        (result) =>
          result.resContent.status === "rejected" ||
          result.resContent.value.success === false ||
          (result.resContent.value.data &&
            result.resContent.value.data.exists === false),
      );

    if (errorResults.length > 0) {
      const errArr = [];
      for (let err of errorResults) {
        const comm = targetKSNodes[err.index];

        if (err.resContent.status === "rejected") {
          errArr.push(`name: ${comm.node_name}, err: ${err.resContent.reason}`);
        } else if (err.resContent.value.success === false) {
          errArr.push(
            `name: ${comm.node_name}, err: ${err.resContent.value.err}`,
          );
        } else if (
          err.resContent.value.data &&
          err.resContent.value.data.exists === false
        ) {
          errArr.push(`name: ${comm.node_name}, err: keyshare does not exist`);
        } else {
          errArr.push(
            `name: ${comm.node_name}, err: ${err.resContent.value.err}`,
          );
        }
      }

      const errMsg = errArr.join("\n");

      return {
        success: false,
        code: "KEYSHARE_NODE_INSUFFICIENT",
        msg: errMsg,
      };
    }

    return {
      success: true,
      data: {
        nodeIds,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: error instanceof Error ? error.message : String(error),
    };
  }
}
