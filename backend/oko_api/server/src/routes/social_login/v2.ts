import express from "express";

import { setSocialLoginRoutes } from "./social_login";
import { setReferralRoutes, setReferralRoutesV2 } from "./referral";

export function makeSocialLoginV2Router() {
  const router = express.Router();

  setReferralRoutesV2(router);

  return router;
}
