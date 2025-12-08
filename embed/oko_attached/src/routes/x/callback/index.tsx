import { createFileRoute } from "@tanstack/react-router";

import { XCallback } from "@oko-wallet-attached/components/x_callback/x_callback";

export const Route = createFileRoute("/x/callback/")({
  component: XCallback,
});
