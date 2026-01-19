import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import * as middlewares from "./middlewares";
import api from "./api";
import v2 from "./api/v2";

require("dotenv").config();

const app = express();

app.locals = app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get<object, string>("/", (_, res) => {
  res.send("Ok");
});

app.use("/v1", api);
app.use("/v2", v2);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
