export type TeddsaErrorCode =
  | "WASM_NOT_INITIALIZED"
  | "WASM_INIT_FAILED"
  | "KEYGEN_FAILED"
  | "SIGN_ROUND1_FAILED"
  | "SIGN_ROUND2_FAILED"
  | "AGGREGATE_FAILED"
  | "VERIFY_FAILED"
  | "INVALID_INPUT"
  | "SERIALIZATION_ERROR";

export class TeddsaException extends Error {
  readonly code: TeddsaErrorCode;
  readonly cause?: unknown;

  constructor(code: TeddsaErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "TeddsaException";
    this.code = code;
    this.cause = cause;
  }
}
