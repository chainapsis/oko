import type { EmailResult, SMTPConfig } from "@oko-wallet/oko-types/admin";
import { sendEmail } from "@oko-wallet-admin-api/email";

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string,
  verification_code: string,
  customer_label: string,
  from_email: string,
  email_verification_expiration_minutes: number,
  smtp_config: SMTPConfig,
): Promise<EmailResult> {
  // @TODO: email template should be updated
  const subject = `Verification Code for ${customer_label}`;

  const text = `
Your verification code is: ${verification_code}

This code will expire in ${email_verification_expiration_minutes} minutes.

If you didn't request this code, please ignore this email.
  `;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Email Verification</h2>
  <p>Your verification code for <strong>${customer_label}</strong> is:</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
      ${verification_code}
    </span>
  </div>
  
  <p style="color: #666;">This code will expire in ${email_verification_expiration_minutes} minutes.</p>
  
  <p style="color: #999; font-size: 12px;">
    If you didn't request this code, please ignore this email.
  </p>
</div>
  `;

  console.info(
    "Sending verification email, email: %s, content len: %s",
    email,
    html.length,
  );

  return sendEmail(
    {
      from: from_email,
      to: email,
      subject,
      text,
      html,
    },
    smtp_config,
  );
}
