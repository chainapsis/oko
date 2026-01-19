import express from "express";

import { setReferralRoutes, setReferralRoutesV2 } from "./referral";
import { setSocialLoginRoutes } from "./social_login";

export function makeSocialLoginRouter() {
  const router = express.Router();

  setSocialLoginRoutes(router);
  setReferralRoutes(router);

  return router;
}

export function makeSocialLoginV2Router() {
  const router = express.Router();

  setReferralRoutesV2(router);

  return router;
}
