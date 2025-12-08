import { createFileRoute } from "@tanstack/react-router";

import { EmailLogin } from "@oko-wallet-attached/components/email/email_login";

export const Route = createFileRoute("/email/")({
  component: EmailLogin,
});

