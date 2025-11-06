import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
  GetTssAllActivationSettingResponse,
  SetTssAllActivationSettingRequest,
  SetTssAllActivationSettingResponse,
} from "@oko-wallet/ewallet-types/admin";

import { errorHandle } from "@oko-wallet-admin/fetch/utils";
import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";

export async function getTSSSessionsList({
  token,
  limit = 10,
  offset = 0,
  node_id,
}: {
  token: string;
  limit?: number;
  offset?: number;
  node_id?: string;
}) {
  const body: GetTssSessionListRequest = {
    limit,
    offset,
    node_id,
  };

  return errorHandle<GetTssSessionListResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/tss/get_tss_session_list`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function getTssAllActivationSetting({ token }: { token: string }) {
  return errorHandle<GetTssAllActivationSettingResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/tss/get_tss_all_activation_setting`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}

export async function setTssAllActivationSetting({
  token,
  is_enabled,
}: {
  token: string;
  is_enabled: boolean;
}) {
  const body: SetTssAllActivationSettingRequest = {
    is_enabled,
  };

  return errorHandle<SetTssAllActivationSettingResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/tss/set_tss_all_activation_setting`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}
