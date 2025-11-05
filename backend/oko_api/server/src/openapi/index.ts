import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import { getOpenApiDocument } from "@oko-wallet/ewallet-api-openapi";

export function installSwaggerDocs(app: Express) {
  console.log("Installing Swagger with Zod");

  const openApiDoc = getOpenApiDocument();

  app.use(
    "/api_docs",
    swaggerUi.serve as any,
    swaggerUi.setup(openApiDoc) as any,
  );
}
