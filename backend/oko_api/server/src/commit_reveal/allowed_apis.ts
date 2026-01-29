import type { OperationType } from "@oko-wallet/oko-types/commit_reveal";

/**
 * Defines which API names are allowed for each operation type.
 * Each operation type has a specific set of APIs that can be called.
 */
export const ALLOWED_APIS: Record<OperationType, string[]> = {
  sign_in: ["signin"],
  sign_up: ["keygen"],
  sign_in_reshare: ["signin", "reshare"], // signin first, then reshare
  add_ed25519: ["keygen_ed25519"],
};

/**
 * Defines which API names mark the completion of an operation.
 * When a final API is successfully called, the session state changes to COMPLETED.
 */
export const FINAL_APIS: Record<OperationType, string[]> = {
  sign_in: ["signin"],
  sign_up: ["keygen"],
  sign_in_reshare: ["reshare"],
  add_ed25519: ["keygen_ed25519"],
};

export function isApiAllowed(
  operationType: OperationType,
  apiName: string,
): boolean {
  return ALLOWED_APIS[operationType].includes(apiName);
}

export function isFinalApi(
  operationType: OperationType,
  apiName: string,
): boolean {
  return FINAL_APIS[operationType].includes(apiName);
}
