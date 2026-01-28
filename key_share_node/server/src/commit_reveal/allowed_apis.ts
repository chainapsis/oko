import type { OperationType } from "@oko-wallet/ksn-interface/commit_reveal";

export const ALLOWED_APIS: Record<OperationType, string[]> = {
  sign_up: ["register", "register_ed25519"],
  sign_in: ["get_key_shares"],
  reshare: ["get_key_shares", "reshare", "reshare_register"],
};

export function isApiAllowed(
  operationType: OperationType,
  apiName: string,
): boolean {
  return ALLOWED_APIS[operationType].includes(apiName);
}
