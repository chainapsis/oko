import { createFileRoute } from "@tanstack/react-router";

import { GoogleCallback } from "@oko-wallet-attached/components/google_callback/google_callback";

export const Route = createFileRoute("/google/callback/")({
  component: GoogleCallback,
});
