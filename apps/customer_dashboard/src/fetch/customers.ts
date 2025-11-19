import type { APIKey } from "@oko-wallet/oko-types/ct_dashboard";
import type {
  Customer,
  UpdateCustomerInfoResponse,
} from "@oko-wallet/oko-types/customers";

import { errorHandle } from "./utils";
import { OKO_API_ENDPOINT } from ".";

export const CUSTOMER_V1_ENDPOINT = `${OKO_API_ENDPOINT}/customer_dashboard/v1`;

export async function requestGetCustomerInfo({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  return errorHandle<Customer>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/info`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    }),
  );
}

export async function requestGetCustomerAPIKeys({
  token,
  email,
  customer_id,
}: {
  token: string;
  email: string;
  customer_id: string;
}) {
  return errorHandle<APIKey[]>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/api_keys`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, customer_id }),
    }),
  );
}

export async function requestUpdateCustomerInfo({
  token,
  label,
  logoFile,
}: {
  token: string;
  label?: string;
  logoFile?: File | null;
}) {
  // Note: Reasons for using FormData:
  // - Need to send file upload (logo) and text data together
  // - `multipart/form-data` format allows server to handle files and data simultaneously
  const formData = new FormData();

  if (label !== undefined && label.trim() !== "") {
    formData.append("label", label);
  }

  if (logoFile) {
    formData.append("logo", logoFile);
  }

  return errorHandle<UpdateCustomerInfoResponse>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/update_info`, {
      method: "POST",
      headers: {
        // browser automatically sets multipart/form-data with boundary
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }),
  );
}
