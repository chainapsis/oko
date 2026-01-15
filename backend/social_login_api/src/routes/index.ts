import express from "express";

import { setReferralRoutes } from "./referral";
import { setSocialLoginRoutes } from "./social_login";

export function makeSocialLoginRouter() {
  const router = express.Router();

  setSocialLoginRoutes(router);
  setReferralRoutes(router);

  return router;
}
