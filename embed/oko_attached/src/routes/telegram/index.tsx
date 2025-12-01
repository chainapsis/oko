import { createFileRoute } from "@tanstack/react-router";

import { AttachedInitialized } from "@oko-wallet-attached/components/attached_initialized/attached_initialized";
import { TelegramLogin } from "@oko-wallet-attached/components/telegram/telegram";

export const Route = createFileRoute("/telegram/")({
  component: Component,
});

function Component() {
  return (
    <AttachedInitialized>
      <TelegramLogin />
    </AttachedInitialized>
  );
}
