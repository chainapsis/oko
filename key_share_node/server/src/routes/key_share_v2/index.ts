import { Router, type Response } from "express";
import type {
  CheckKeyShareV2Request,
  CheckKeyShareV2RequestBody,
  CheckKeyShareV2Response,
  GetKeyShareV2Request,
  GetKeyShareV2RequestBody,
  GetKeyShareV2Response,
  RegisterKeyShareV2Request,
  RegisterKeyShareV2RequestBody,
  RegisterEd25519V2Request,
  RegisterEd25519V2RequestBody,
  ReshareKeyShareV2Request,
  ReshareKeyShareV2RequestBody,
  ReshareRegisterV2Request,
  ReshareRegisterV2RequestBody,
} from "@oko-wallet/ksn-interface/key_share";
import { Bytes } from "@oko-wallet/bytes";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import {
  checkKeyShareV2,
  getKeyShareV2,
  registerKeyShareV2,
  registerEd25519V2,
  reshareKeyShareV2,
  reshareRegisterV2,
} from "@oko-wallet-ksn-server/api/key_share";
import {
  bearerTokenMiddleware,
  type AuthenticatedRequest,
} from "@oko-wallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type {
  ResponseLocal,
  KSNodeRequest,
} from "@oko-wallet-ksn-server/routes/io";
import { registry } from "@oko-wallet-ksn-server/openapi/doc";
import {
  CheckKeyShareV2RequestBodySchema,
  CheckKeyShareV2SuccessResponseSchema,
  GetKeyShareV2RequestBodySchema,
  GetKeyShareV2SuccessResponseSchema,
  RegisterKeyShareV2RequestBodySchema,
  RegisterKeyShareV2SuccessResponseSchema,
  RegisterEd25519V2RequestBodySchema,
  RegisterEd25519V2SuccessResponseSchema,
  ReshareKeyShareV2RequestBodySchema,
  ReshareKeyShareV2SuccessResponseSchema,
  ReshareRegisterV2RequestBodySchema,
  ReshareRegisterV2SuccessResponseSchema,
  ErrorResponseSchema,
} from "@oko-wallet-ksn-server/openapi/schema";
import { getKeysharesV2 } from "./get_key_shares";
import { keyshareV2Check } from "./check";
import { keyshareV2Register } from "./register";
import { registerKeyshareEd25519 } from "./ed25519";
import { keyshareV2Reshare } from "./reshare";
import { keyshareV2ReshareRegister } from "./reshare_register";

export function makeKeyshareV2Router() {
  const router = Router();

  router.post("/", bearerTokenMiddleware, getKeysharesV2);

  router.post("/check", keyshareV2Check);

  router.post("/register", bearerTokenMiddleware, keyshareV2Register);

  router.post(
    "/register/ed25519",
    bearerTokenMiddleware,
    registerKeyshareEd25519,
  );

  router.post("/reshare", bearerTokenMiddleware, keyshareV2Reshare);

  router.post(
    "/reshare/register",
    bearerTokenMiddleware,
    keyshareV2ReshareRegister,
  );

  return router;
}
