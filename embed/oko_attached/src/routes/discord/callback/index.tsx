import { createFileRoute } from "@tanstack/react-router";

import { DiscordCallback } from "@oko-wallet-attached/components/discord_callback/discord_callback";

export const Route = createFileRoute("/discord/callback/")({
  component: DiscordCallback,
});
