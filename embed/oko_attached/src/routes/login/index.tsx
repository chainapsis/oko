import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@oko-wallet-attached/components/login/login";

export const Route = createFileRoute("/login/")({
  component: Login,
});
