import type { APIKey } from "@oko-wallet/ewallet-types/ct_dashboard";
import type { Customer } from "@oko-wallet/ewallet-types/customers";

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
