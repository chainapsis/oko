import express from "express";

import { setSocialLoginRoutes } from "./social_login";

export function makeSocialLoginRouter() {
  const router = express.Router();

  setSocialLoginRoutes(router);

  return router;
}
