import type { EmailResult, SMTPConfig } from "@oko-wallet/oko-types/admin";
import { sendEmail } from "@oko-wallet-admin-api/email";

export async function sendPasswordResetEmail(
  email: string,
  verification_code: string,
  customer_label: string,
  from_email: string,
  email_verification_expiration_minutes: number,
  smtp_config: SMTPConfig,
): Promise<EmailResult> {
  const subject = `Reset Password Verification Code for ${customer_label}`;

  // temp
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Reset Password</title>
      <style>
        body { font-family: Inter, Arial, sans-serif; background-color: #ededed; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; margin-top: 32px; }
        .title { font-size: 24px; font-weight: bold; color: #111111; margin-bottom: 16px; }
        .code { font-size: 32px; font-weight: bold; color: #000000; letter-spacing: 4px; margin: 24px 0; background-color: #f5f5f5; padding: 16px; text-align: center; border-radius: 8px; }
        .text { font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 16px; }
        .warning { font-size: 14px; color: #666666; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Reset Your Password</div>
        <div class="text">
          You have requested to reset your password for ${customer_label}.
          Please use the verification code below to proceed.
        </div>

        <div class="code">${verification_code}</div>

        <div class="text">
          This code will expire in ${email_verification_expiration_minutes} minutes.
        </div>

        <div class="warning">
          <strong>If you did not request a password reset, please ignore this email.</strong>
          Your account remains secure.
        </div>
      </div>
    </body>
    </html>
  `;

  console.info(
    "Sending password reset email, email: %s, content len: %s",
    email,
    html.length,
  );

  return sendEmail(
    {
      from: from_email,
      to: email,
      subject,
      html,
    },
    smtp_config,
  );
}
