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

export async function sendCustomerUserPasswordEmail(
  email: string,
  password: string,
  from_email: string,
  smtp_config: SMTPConfig,
) {
  const subject = "Temporary password for your Oko Dashboard login";
  const escapedPassword = he.escape(password);

  const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
    <head>
      <meta charset="utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings
                xmlns:o="urn:schemas-microsoft-com:office:office"
              >
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <style>
            td,
            th,
            div,
            p,
            a,
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              font-family: "Segoe UI", sans-serif;
              mso-line-height-rule: exactly;
            }
          </style>
        <![endif]-->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap" rel="stylesheet" media="screen">
      <style>
        @media (max-width: 600px) {
          .sm-px-4 {
            padding-left: 16px !important;
            padding-right: 16px !important
          }
          .sm-py-6 {
            padding-top: 24px !important;
            padding-bottom: 24px !important
          }
        }
      </style>
    </head>
    <body style="margin: 0; width: 100%; padding: 0; -webkit-font-smoothing: antialiased; word-break: break-word">
      <div role="article" aria-roledescription="email" aria-label lang="en">
        <div class="sm-px-4" style="background-color: #ededed; font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif">
          <table align="center" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%">
            <tr>
              <td class="sm-py-6" style="padding-top: 32px; padding-bottom: 32px">
                <table align="center" role="presentation" cellpadding="0" cellspacing="0" style="margin-left: auto; margin-right: auto; width: 600px; max-width: 100%; border-spacing: 0">
                  <tr>
                    <td style="padding: 0">
                      <table role="presentation" style="width: 100%; border-radius: 28px; background-color: #ededed; border-spacing: 0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px">
                            <div style="position: relative; width: 100%">
                              <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/header.png" width="584" alt="Red Oko header with 'Welcome to Oko' text" style="vertical-align: middle; display: block; width: 584px; max-width: 100%; border-radius: 20px">
                            </div>
                            <div style="height: 972px; width: 100%">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-spacing: 0">
                                <tr>
                                  <td align="center" valign="top" style="padding-top: 32px">
                                    <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="border-spacing: 0; width: 360px; max-width: 100%">
                                      <tr>
                                        <td valign="top" style="height: 793px">
                                          <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="border-spacing: 0; height: 793px; width: 360px; max-width: 100%">
                                            <tr>
                                              <td>
                                                <p style="font-family: Inter, Arial, sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; font-size: 16px; font-weight: 500; line-height: 160%">
                                                  Hi there,
                                                  <br>
                                                  <br>
                                                  Welcome to Oko, and thanks for
                                                  integrating with us!
                                                </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="33.72" style="
                                                height: 33.72px;
                                                line-height: 33.72px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <p style="font-family: Inter, Arial, sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; font-size: 16px; font-weight: 500; line-height: 160%">
                                                  You can now log in to the Oko dApp
                                                  Dashboard using the email address
                                                  you shared with us and the temporary
                                                  password below.
                                                </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="32" style="
                                                height: 32px;
                                                line-height: 32px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <table role="presentation" width="360" align="center" cellpadding="0" cellspacing="0" style="border-spacing: 0; width: 360px; max-width: 100%">
                                                  <tr>
                                                    <td style="
                                                      background-color: #ffffff;
                                                      border-radius: 16px;
                                                    ">
                                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0">
                                                        <tr>
                                                          <td align="left" style="
                                                            padding: 10px 0 0 10px;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/screw-top-left.png" width="16" height="16" alt="Decorative layout screw" style="max-width: 100%; vertical-align: middle; display: block; border: 0; outline: none; text-decoration: none">
                                                          </td>
                                                          <td align="right" style="
                                                            padding: 10px 10px 0 0;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/screw-top-right.png" width="16" height="16" alt="Decorative layout screw" style="max-width: 100%; vertical-align: middle; display: block; border: 0; outline: none; text-decoration: none">
                                                          </td>
                                                        </tr>
                                                      </table>
                                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0">
                                                        <tr>
                                                          <td align="center" style="
                                                            padding: 32px 32px 24px;
                                                          ">
                                                            <table role="presentation" width="296" cellpadding="0" cellspacing="0" style="border-spacing: 0; margin-left: auto; margin-right: auto; width: 296px; max-width: 100%">
                                                              <tr>
                                                                <td style="height: 26px">
                                                                  <p style="font-family: Inter, Arial,
                                                                      sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; text-align: center; font-size: 16px; font-weight: 500; line-height: 160%">
                                                                    Your temporary
                                                                    password is
                                                                  </p>
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td height="8" style="
                                                                  height: 8px;
                                                                  line-height: 8px;
                                                                  font-size: 0;
                                                                ">
                                                                  &nbsp;
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td style="height: 30px">
                                                                  <p style="font-family: Inter, Arial,
                                                                      sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; text-align: center; font-size: 20px; font-weight: 600; line-height: 150%">
                                                                    ${escapedPassword}
                                                                  </p>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
                                                              border-spacing: 0;
                                                            ">
                                                              <tr>
                                                                <td height="24" style="
                                                                  height: 24px;
                                                                  line-height: 24px;
                                                                  font-size: 0;
                                                                ">
                                                                  &nbsp;
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td align="center">
                                                                  <table role="presentation" width="109" cellpadding="0" cellspacing="0" style="
                                                                    width: 109px;
                                                                    border-spacing: 0;
                                                                  ">
                                                                    <tr>
                                                                      <td align="center" bgcolor="#1c1b1f" style="
                                                                        background-color: #1c1b1f;
                                                                        border-radius: 222px;
                                                                        height: 45px;
                                                                      ">
                                                                        <a href="https://dapp.oko.app" style="
                                                                          display: inline-block;
                                                                          padding: 12px 32px;
                                                                          font-family:
                                                                            Inter,
                                                                            Arial,
                                                                            sans-serif;
                                                                          font-weight: 500;
                                                                          font-size: 14px;
                                                                          line-height: 150%;
                                                                          letter-spacing: -0.01em;
                                                                          color: #fffffe;
                                                                          text-decoration: none;
                                                                          text-align: center;
                                                                        ">
                                                                          Sign In
                                                                        </a>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
                                                              border-spacing: 0;
                                                            ">
                                                              <tr>
                                                                <td height="24" style="
                                                                  height: 24px;
                                                                  line-height: 24px;
                                                                  font-size: 0;
                                                                ">
                                                                  &nbsp;
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td align="center">
                                                                  <table role="presentation" width="296" cellpadding="0" cellspacing="0" style="border-spacing: 0; width: 296px; max-width: 100%">
                                                                    <tr>
                                                                      <td>
                                                                        <p style="font-family: Inter,
                                                                            Arial,
                                                                            sans-serif; letter-spacing: -0.01em; color: rgba(
                                                                            28,
                                                                            27,
                                                                            31,
                                                                            0.5
                                                                          ); margin: 0; text-align: center; font-size: 14px; font-weight: 500; line-height: 150%">
                                                                          Please sign
                                                                          in and
                                                                          update your
                                                                          password
                                                                          after your
                                                                          first login.
                                                                        </p>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0">
                                                        <tr>
                                                          <td align="left" style="
                                                            padding: 0 0 10px 10px;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/screw-bottom-left.png" width="16" height="16" alt="Decorative layout screw" style="max-width: 100%; vertical-align: middle; display: block; border: 0; outline: none; text-decoration: none">
                                                          </td>
                                                          <td align="right" style="
                                                            padding: 0 10px 10px 0;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/screw-bottom-right.png" width="16" height="16" alt="Decorative layout screw" style="max-width: 100%; vertical-align: middle; display: block; border: 0; outline: none; text-decoration: none">
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="32" style="
                                                height: 32px;
                                                line-height: 32px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="border-spacing: 0; width: 360px; max-width: 100%">
                                                  <tr>
                                                    <td>
                                                      <p style="font-family: Inter, Arial, sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; font-size: 16px; font-weight: 500; line-height: 160%">
                                                        Here are a few links that may
                                                        help during integration:
                                                      </p>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td height="16" style="
                                                      height: 16px;
                                                      line-height: 16px;
                                                      font-size: 0;
                                                    ">
                                                      &nbsp;
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td>
                                                      <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="
                                                        width: 360px;
                                                        border-spacing: 0;
                                                      ">
                                                        <tr>
                                                          <td width="16" style="
                                                            width: 16px;
                                                            padding-right: 12px;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/icon-demo.png" width="16" height="16" alt="Demo icon" style="max-width: 100%; vertical-align: middle; display: block; width: 16px; height: 16px">
                                                          </td>
                                                          <td>
                                                            <a href="https://demo.oko.app/" style="font-family: Inter, Arial,
                                                                sans-serif; letter-spacing: -0.01em; color: #1c1b1f; font-size: 16px; font-weight: 500; line-height: 160%; text-decoration: underline">
                                                              Demo
                                                            </a>
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td height="8" colspan="2" style="
                                                            height: 8px;
                                                            line-height: 8px;
                                                            font-size: 0;
                                                          ">
                                                            &nbsp;
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td width="16" style="
                                                            width: 16px;
                                                            padding-right: 12px;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/icon-docs.png" width="16" height="16" alt="Docs icon" style="max-width: 100%; vertical-align: middle; display: block; width: 16px; height: 16px">
                                                          </td>
                                                          <td>
                                                            <a href="https://docs.oko.app/docs" style="font-family: Inter, Arial,
                                                                sans-serif; letter-spacing: -0.01em; color: #1c1b1f; font-size: 16px; font-weight: 500; line-height: 160%; text-decoration: underline">
                                                              Docs
                                                            </a>
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td height="8" colspan="2" style="
                                                            height: 8px;
                                                            line-height: 8px;
                                                            font-size: 0;
                                                          ">
                                                            &nbsp;
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td width="16" style="
                                                            width: 16px;
                                                            padding-right: 12px;
                                                          ">
                                                            <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/icon-inquiries.png" width="16" height="16" alt="Integration Inquiries icon" style="max-width: 100%; vertical-align: middle; display: block; width: 16px; height: 16px">
                                                          </td>
                                                          <td>
                                                            <a href="https://oko-wallet.canny.io/integration-support-inquiries" style="font-family: Inter, Arial,
                                                                sans-serif; letter-spacing: -0.01em; color: #1c1b1f; font-size: 16px; font-weight: 500; line-height: 160%; text-decoration: underline">
                                                              Integration Inquiries
                                                            </a>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="32" style="
                                                height: 32px;
                                                line-height: 32px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="border-spacing: 0; height: 26px; width: 360px; max-width: 100%">
                                                  <tr>
                                                    <td>
                                                      <p style="font-family: Inter, Arial, sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; font-size: 16px; font-weight: 500; line-height: 160%">
                                                        Thanks!
                                                      </p>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="32" style="
                                                height: 32px;
                                                line-height: 32px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <table role="presentation" width="360" cellpadding="0" cellspacing="0" style="border-spacing: 0; height: 26px; width: 360px; max-width: 100%">
                                                  <tr>
                                                    <td align="center">
                                                      <p style="font-family: Inter, Arial, sans-serif; letter-spacing: -0.01em; color: #1c1b1f; margin: 0; text-align: center; font-size: 16px; font-weight: 500; line-height: 160%">
                                                        Oko Team
                                                      </p>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="33.72" style="
                                                height: 33.72px;
                                                line-height: 33.72px;
                                                font-size: 0;
                                              ">
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="center">
                                                <img src="https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/email/light/logo-footer.png" width="64" height="25" alt="Gray Oko logo" style="max-width: 100%; vertical-align: middle; display: block; width: 64px; height: 25px">
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
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
      html,
    },
    smtp_config,
  );
}
