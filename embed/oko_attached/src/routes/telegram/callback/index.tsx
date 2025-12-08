import { createFileRoute } from "@tanstack/react-router";

import { TelegramCallback } from "@oko-wallet-attached/components/telegram_callback/telegram_callback";

export const Route = createFileRoute("/telegram/callback/")({
  component: TelegramCallback,
});
