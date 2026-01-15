"use client";

import AccountInfo from "./AccountInfo";
import { X402Widget } from "./x402_widget";

interface ConnectedViewProps {
  address: string;
  onDisconnect: () => void;
}

export default function ConnectedView({
  address,
  onDisconnect,
}: ConnectedViewProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0">
          <AccountInfo address={address} onDisconnect={onDisconnect} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          <X402Widget />
        </div>
      </div>
    </div>
  );
}
