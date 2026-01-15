import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { logger } from "@oko-wallet-ksn-server/logger";

import { getOpenApiDocument } from "./doc";

export function installSwaggerDocs(app: Express) {
  logger.debug("Installing Swagger with Zod");

  const openApiDoc = getOpenApiDocument();

  app.use(
    "/api_docs",
    swaggerUi.serve as any,
    swaggerUi.setup(openApiDoc) as any,
  );
}
