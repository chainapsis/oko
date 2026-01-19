import { Router } from "express";

import { oauthMiddleware } from "@oko-wallet-tss-api/middleware/oauth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";
import { keygenV2 } from "./keygen";
import { userJwtMiddlewareV2 } from "@oko-wallet-tss-api/middleware/keplr_auth";
import { presignStep1 } from "./presign_step_1";
import { presignStep2 } from "./presign_step_2";
import { presignStep3 } from "./presign_step_3";
import { signStep1 } from "./sign_step_1";
import { signStep2 } from "./sign_step_2";
import { signEd25519Round1 } from "./sign_ed25519_round1";
import { signEd25519Round2 } from "./sign_ed25519_round2";
import { apiKeyMiddleware } from "@oko-wallet-tss-api/middleware/api_key_auth";
import { triplesStep1 } from "./triples_step_1";
import { triplesStep2 } from "./triples_step_2";
import { triplesStep3 } from "./triples_step_3";
import { triplesStep4 } from "./triples_step_4";
import { triplesStep5 } from "./triples_step_5";
import { triplesStep6 } from "./triples_step_6";
import { triplesStep7 } from "./triples_step_7";
import { triplesStep8 } from "./triples_step_8";
import { triplesStep9 } from "./triples_step_9";
import { triplesStep10 } from "./triples_step_10";
import { triplesStep11 } from "./triples_step_11";
import { keygenEd25519 } from "./keygen_ed25519";
import { userSignInV2 } from "./user_signin";
import { userReshareV2 } from "./user_reshare";
import { userCheckEmailV2 } from "./user_check_email";

export function makeV2Router() {
  const router = Router();

  router.post("/keygen", oauthMiddleware, tssActivateMiddleware, keygenV2);

  router.post(
    "/keygen_ed25519",
    oauthMiddleware,
    tssActivateMiddleware,
    keygenEd25519,
  );

  router.post(
    "/presign/step1",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    presignStep1,
  );

  router.post(
    "/presign/step2",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    presignStep2,
  );

  router.post(
    "/presign/step3",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    presignStep3,
  );

  router.post(
    "/sign/step1",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    signStep1,
  );

  router.post(
    "/sign/step2",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    signStep2,
  );

  router.post(
    "/sign_ed25519/round1",
    [apiKeyMiddleware, userJwtMiddlewareV2, tssActivateMiddleware],
    signEd25519Round1,
  );

  router.post(
    "/sign_ed25519/round2",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    signEd25519Round2,
  );

  router.post(
    "/triples/step1",
    [apiKeyMiddleware, userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep1,
  );

  router.post(
    "/triples/step2",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep2,
  );

  router.post(
    "/triples/step3",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep3,
  );

  router.post(
    "/triples/step4",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep4,
  );

  router.post(
    "/triples/step5",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep5,
  );

  router.post(
    "/triples/step6",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep6,
  );

  router.post(
    "/triples/step7",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep7,
  );

  router.post(
    "/triples/step8",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep8,
  );

  router.post(
    "/triples/step9",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep9,
  );

  router.post(
    "/triples/step10",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep10,
  );

  router.post(
    "/triples/step11",
    [userJwtMiddlewareV2, tssActivateMiddleware],
    triplesStep11,
  );

  router.post(
    "/user/signin",
    oauthMiddleware,
    tssActivateMiddleware,
    userSignInV2,
  );

  router.post(
    "/user/reshare",
    oauthMiddleware,
    tssActivateMiddleware,
    userReshareV2,
  );

  router.post("/user/check", userCheckEmailV2);

  return router;
}
