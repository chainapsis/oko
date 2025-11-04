import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { makeLogRouter } from "@oko-wallet-log-api/routes";

export function makeApp(env: {
  ES_URL: string;
  ES_INDEX: string;
  ES_USERNAME: string;
  ES_PASSWORD: string;
}) {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get<{}, string>("/", (_, res) => {
    res.send("Ok");
  });

  app.use(
    "/log/v1",
    makeLogRouter({
      esUrl: env.ES_URL,
      esIndex: env.ES_INDEX,
      esUsername: env.ES_USERNAME,
      esPassword: env.ES_PASSWORD,
    }),
  );

  return app;
}
