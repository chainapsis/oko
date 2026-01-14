import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { makeV1Router } from "@oko-wallet-tss-api/routes/v1";
import { makeV2Router } from "@oko-wallet-tss-api/routes/v2";

export function makeApp(env: {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ENCRYPTION_SECRET: string;
}) {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get<{}, string>("/", (_, res) => {
    res.send("Ok");
  });

  app.use("/tss/v1", makeV1Router);
  app.use("/tss/v2", makeV2Router);

  app.locals.jwt_secret = env.JWT_SECRET;
  app.locals.jwt_expires_in = env.JWT_EXPIRES_IN;
  app.locals.encryption_secret = env.ENCRYPTION_SECRET;

  return app;
}
