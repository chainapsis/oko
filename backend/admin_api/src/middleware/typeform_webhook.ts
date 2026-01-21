import type { Result } from "@oko-wallet/stdlib-js";
import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import express from "express";

const rawBodyMiddleware = express.raw({
  type: "application/json",
  limit: "10mb",
});

export function verifyTypeformWebhook(
  signatureHeader: string | undefined,
  rawBody: Buffer,
  secret: string,
): Result<void, string> {
  if (!signatureHeader) {
    return { success: false, err: "Missing Typeform-Signature header" };
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  const expectedSignature = `sha256=${hash}`;

  const headerBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (headerBuffer.length !== expectedBuffer.length) {
    return { success: false, err: "Invalid signature length" };
  }

  const isValid = crypto.timingSafeEqual(headerBuffer, expectedBuffer);

  if (!isValid) {
    return { success: false, err: "Invalid signature" };
  }

  return { success: true, data: void 0 };
}

export function typeformWebhookMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  rawBodyMiddleware(req, res, (err) => {
    if (err) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: "Failed to parse request body",
      });
      return;
    }

    const payloadBuffer = req.body as Buffer;
    const signatureHeader = req.headers["typeform-signature"] as
      | string
      | undefined;

    const verification = verifyTypeformWebhook(
      signatureHeader,
      payloadBuffer,
      req.app.locals.typeform_webhook_secret,
    );
    if (!verification.success) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        msg: verification.err,
      });
      return;
    }

    next();
  });
}
