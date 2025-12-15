import express from "express";

import { setSocialLoginRoutes } from "./social_login";
import { setReferralRoutes } from "./referral";

export function makeSocialLoginRouter() {
  const router = express.Router();

  setSocialLoginRoutes(router);
  setReferralRoutes(router);

  return router;
}
