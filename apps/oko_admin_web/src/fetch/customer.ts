import type { CreateCustomerWithDashboardUserRequest } from "@oko-wallet/oko-types/admin";
import type {
  Customer,
  CustomerWithAPIKeys,
} from "@oko-wallet/oko-types/customers";

import { errorHandle } from "@oko-wallet-admin/fetch/utils";
import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";

export async function getCustomerListWithAPIKeys({
  token,
  limit = 10,
  offset = 0,
}: {
  token: string;
  limit?: number;
  offset?: number;
}) {
  return errorHandle<{
    customerWithAPIKeysList: CustomerWithAPIKeys[];
    pagination: {
      total: number;
      current_page: number;
      total_pages: number;
    };
  }>(() =>
    fetch(
      `${OKO_ADMIN_API_ENDPOINT_V1}/customer/get_customer_list?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    ),
  );
}

export async function getCustomer({
  token,
  customer_id,
}: {
  token: string;
  customer_id: string;
}) {
  return errorHandle<Customer>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/customer/get_customer/${customer_id}`, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}

export async function addCustomer({
  token,
  data,
}: {
  token: string;
  data: CreateCustomerWithDashboardUserRequest & { logo?: File };
}) {
  // Note: Reasons for using FormData:
  // - Need to send file upload (logo) and text data together
  // - `multipart/form-data` format allows server to handle files and data simultaneously
  const formData = new FormData();

  formData.append("email", data.email);
  formData.append("label", data.label);

  if (data.url) {
    formData.append("url", data.url);
  }

  if (data.logo) {
    formData.append("logo", data.logo);
  }

  return errorHandle<any>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/customer/create_customer`, {
      method: "POST",
      headers: {
        // browser automatically sets multipart/form-data
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }),
  );
}

export async function deleteCustomerAndCTDUsers({
  token,
  customer_id,
}: {
  token: string;
  customer_id: string;
}) {
  return errorHandle<any>(() =>
    fetch(
      `${OKO_ADMIN_API_ENDPOINT_V1}/customer/delete_customer/${customer_id}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    ),
  );
}
