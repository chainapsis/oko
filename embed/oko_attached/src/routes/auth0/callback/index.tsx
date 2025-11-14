import { createFileRoute } from "@tanstack/react-router";

import { Auth0Callback } from "@oko-wallet-attached/components/auth0_callback/auth0_callback";

export const Route = createFileRoute("/auth0/callback/")({
  component: Auth0Callback,
});
