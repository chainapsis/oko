"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import Button from "./Button";

export default function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} size="lg" fullWidth>
                    Connect Wallet
                  </Button>
                );
              }
              if (chain?.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    size="lg"
                    fullWidth
                    variant="ghost"
                  >
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="flex items-center gap-3 w-full">
                  <Button
                    onClick={openChainModal}
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    {chain?.hasIcon && chain?.iconUrl ? (
                      <span
                        className="inline-flex items-center justify-center rounded-full overflow-hidden"
                        style={{
                          width: 16,
                          height: 16,
                          background: chain.iconBackground,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={chain.iconUrl}
                          alt={chain.name ?? "Chain icon"}
                          width={16}
                          height={16}
                        />
                      </span>
                    ) : null}
                    {chain?.name}
                  </Button>
                  <Button onClick={openAccountModal} fullWidth>
                    {account?.displayName}
                    {account?.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
