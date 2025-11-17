import { createFileRoute } from "@tanstack/react-router";

import { Auth0Popup } from "@oko-wallet-attached/components/auth0_popup/auth0_popup";

export const Route = createFileRoute("/auth0/popup/")({
  component: Auth0Popup,
});
