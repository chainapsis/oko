import type { APIKey } from "../ct_dashboard/api_key";

export type CustomerStatus = "ACTIVE" | "DELETED";

export interface Customer {
  customer_id: string;
  label: string;
  status: CustomerStatus;
  url: string | null;
  logo_url: string | null;
}

export type GetCustomerRequest = { customer_id: string };

export interface DeleteCustomerAndCustomerDashboardUsersRequest {
  customer_id: string;
}

export interface DeleteCustomerAndCustomerDashboardUsersResponse {
  customer_id: string;
  customer_dashboard_user_ids: string[];
}

export interface CustomerWithAPIKeys {
  customer: Customer;
  api_keys: APIKey[];
}
