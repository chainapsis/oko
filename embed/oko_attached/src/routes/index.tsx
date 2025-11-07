import { createFileRoute } from "@tanstack/react-router";

import { Home } from "@oko-wallet-attached/components/home/home";
import { AttachedInitialized } from "@oko-wallet-attached/components/attached_initialized/attached_initialized";

export const Route = createFileRoute("/")({
  component: Component,
});

function Component() {
  return (
    <AttachedInitialized>
      <Home />
    </AttachedInitialized>
  );
}
