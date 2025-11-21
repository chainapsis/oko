import nodemailer from "nodemailer";
import he from "he";
import type {
  SendEmailOptions,
  EmailResult,
  SMTPConfig,
} from "@oko-wallet/oko-types/admin";

export function sendEmailWithTransporter(
  transporter: nodemailer.Transporter,
  options: SendEmailOptions,
): Promise<nodemailer.SentMessageInfo> {
  return transporter.sendMail(options);
}

export async function sendEmail(
  options: SendEmailOptions,
  smtp_config: SMTPConfig,
): Promise<EmailResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: smtp_config.smtp_host,
      port: smtp_config.smtp_port,
      auth: {
        user: smtp_config.smtp_user,
        pass: smtp_config.smtp_pass,
      },
      secure: false, // false for 587(SMRTTLS)
    });
    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: `Email send error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Test SMTP connection and transporter
export function getTransporter(
  host: string,
  port: number,
  user: string,
  pass: string,
): nodemailer.Transporter {
  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
    secure: false, // false for 587(SMRTTLS)
  });
}

// FOR TEST
export async function testEmailConnection(
  host: string,
  port: number,
  user: string,
  pass: string,
): Promise<boolean> {
  try {
    const transporter = getTransporter(host, port, user, pass);
    await transporter.verify();
    console.log("SMTP connection verified");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
}

export async function sendCustomerPasswordEmail(
  email: string,
  password: string,
  customer_label: string,
  from_email: string,
  smtp_config: SMTPConfig,
) {
  // @TODO: email template should be updated
  const subject = `Initial Password for ${customer_label}`;
  const escapedPassword = he.escape(password);
  const escapedCustomerLabel = he.escape(customer_label);

  const text = `
Your initial password for ${escapedCustomerLabel}: ${escapedPassword}

1. Visit https://dapp.oko.app/ and sign in with your email.
2. Use the password above to log in and complete email verification.
3. Update your password immediately after verification.

If you didn't request this account, please ignore this email.
  `;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Initial Password for ${escapedCustomerLabel}</h2>
  <p>Please log in with your email and the initial password below to activate your account:</p>

  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
    <span style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #333;">
      ${escapedPassword}
    </span>
  </div>

  <ol style="color: #444; line-height: 1.6; padding-left: 18px;">
    <li>Visit <a href="https://dapp.oko.app/" target="_blank" rel="noreferrer">https://dapp.oko.app/</a>.</li>
    <li>Sign in with your email and the initial password below.</li>
    <li>Complete the email verification flow.</li>
    <li>Update your password immediately after verification.</li>
  </ol>

  <p style="color: #999; font-size: 12px;">
    If you didn't request this account, please ignore this email.
  </p>
</div>
  `;

  console.info(
    "Sending initial password email, email: %s, content len: %s",
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
