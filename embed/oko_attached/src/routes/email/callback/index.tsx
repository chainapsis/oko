import { createFileRoute } from "@tanstack/react-router";

import { EmailCallback } from "@oko-wallet-attached/components/email_callback/email_callback";

export const Route = createFileRoute("/email/callback/")({
  component: EmailCallback,
});
