import type {
  CreateKSNodeRequest,
  CreateKSNodeResponse,
  DeactivateKSNodeRequest,
  DeactivateKSNodeResponse,
  DeleteKSNodeRequest,
  DeleteKSNodeResponse,
  GetAllKSNodeResponse,
  GetKSNodeByIdResponse,
  UpdateKSNodeRequest,
  UpdateKSNodeResponse,
} from "@oko-wallet/ewallet-types/admin";

import { errorHandle } from "@oko-wallet-admin/fetch/utils";
import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";

export type GetKSNodesParams = {
  token: string;
};

export type GetKSNodeByIdParams = {
  token: string;
  node_id: string;
};

export type CreateKSNodeParams = {
  token: string;
  node_name: string;
  server_url: string;
};

export type DeactivateKSNodeParams = {
  token: string;
  node_id: string;
};

export type DeleteKSNodeParams = {
  token: string;
  node_id: string;
};

export type UpdateKSNodeParams = {
  token: string;
  node_id: string;
  server_url: string;
};

export type ActivateKSNodeParams = {
  token: string;
  node_id: string;
};

export async function getAllKeyShareNodes({ token }: GetKSNodesParams) {
  return errorHandle<GetAllKSNodeResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/get_all_ks_nodes`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}

export async function getKSNodeById({ token, node_id }: GetKSNodeByIdParams) {
  return errorHandle<GetKSNodeByIdResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/get_ks_node_by_id`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ node_id }),
    }),
  );
}

export async function createKeyShareNode({
  token,
  node_name,
  server_url,
}: CreateKSNodeParams) {
  const body: CreateKSNodeRequest = {
    node_name,
    server_url,
  };

  return errorHandle<CreateKSNodeResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/create_ks_node`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function deactivateKeyShareNode({
  token,
  node_id,
}: DeactivateKSNodeParams) {
  const body: DeactivateKSNodeRequest = {
    node_id,
  };

  return errorHandle<DeactivateKSNodeResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/deactivate_ks_node`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function deleteKeyShareNode({
  token,
  node_id,
}: DeleteKSNodeParams) {
  const body: DeleteKSNodeRequest = {
    node_id,
  };

  return errorHandle<DeleteKSNodeResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/delete_ks_node`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function updateKeyShareNode({
  token,
  node_id,
  server_url,
}: UpdateKSNodeParams) {
  const body: UpdateKSNodeRequest = {
    node_id,
    server_url,
  };

  return errorHandle<UpdateKSNodeResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/update_ks_node`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function activateKeyShareNode({
  token,
  node_id,
}: ActivateKSNodeParams) {
  const body = {
    node_id,
  };

  return errorHandle<{ node_id: string }>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/activate_ks_node`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}
