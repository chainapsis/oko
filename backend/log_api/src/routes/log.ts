import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Logger } from "winston";
import type { PostLogBody, PostLogResponse } from "@oko-wallet/oko-types/log";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { ingestLog } from "@oko-wallet-log-api/api/log";
import { rateLimitMiddleware } from "@oko-wallet-log-api/middleware/rate_limit";

export function setLogRoutes(router: Router, clientLogger: Logger) {
  router.post(
    "/",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 100 }),
    async (
      req: Request<any, any, PostLogBody>,
      res: Response<OkoApiResponse<PostLogResponse>>,
    ) => {
      const ingestLogRes = ingestLog(req.body, clientLogger);
      if (ingestLogRes.success === false) {
        return res.status(ErrorCodeMap[ingestLogRes.code]).json(ingestLogRes);
      }
      return res.status(200).json({
        success: true,
        data: ingestLogRes.data,
      });
    },
  );
}
