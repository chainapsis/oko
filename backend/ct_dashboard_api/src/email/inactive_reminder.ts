import type { EmailResult, SMTPConfig } from "@oko-wallet/oko-types/admin";
import { sendEmail } from "@oko-wallet-admin-api/email";

export async function sendInactiveAppReminderEmail(
  email: string,
  customerName: string,
  fromEmail: string,
  smtpConfig: SMTPConfig,
): Promise<EmailResult> {
  const subject = `👋 Finish Setting Up Your Oko Account!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #1c1b1f;">
    <p>Hi ${customerName},</p>

    <p>It looks like you started signing up but haven't quite finished setting up your Oko account yet!</p>

    <p>We're excited for you to start building: Oko is the first fully open-source embedded wallet stack, designed to power your users with a simple, universal, non-custodial wallet.</p>

    <p>We're here to help you get started:</p>

    <p>
        <strong>Need a hand?</strong> Feel free to simply reply to this email.<br>
        <strong>Ready to continue?</strong> <a href="https://dapp.oko.app/users/sign_in" style="color: #0000EE;">Log in</a> and pick up where you left off.<br>
        <strong>Encountering an issue?</strong> You can also submit a ticket through <a href="https://oko-wallet.canny.io/" style="color: #0000EE;"> our support dashboard</a>
    </p>

    <p>We can't wait to see what you build.</p>

    <p>
        Best,<br>
        Oko team
    </p>
</body>
</html>
`;

  return sendEmail(
    {
      from: fromEmail,
      to: email,
      subject,
      html,
    },
    smtpConfig,
  );
}
