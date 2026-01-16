import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { makeCustomerRouter } from "../routes/v1";

// import { setCustomerRoutes } from "@oko-wallet-ctd-api/routes/customer";

dotenv.config();

export function makeApp() {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get<{}, string>("/", (_, res) => {
    res.send("Ok");
  });

  const router = makeCustomerRouter();
  app.use(router);

  return app;
}
