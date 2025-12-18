import React from "react";
import type { MakeSolanaSigData } from "@oko-wallet/oko-sdk-core";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";

import { MetadataContent } from "@oko-wallet-attached/components/modal_variants/common/metadata_content/metadata_content";

export const SolSignatureContent: React.FC<SolSignatureContentProps> = ({
  data,
}) => {
  const { payload, sign_type } = data;
  const { origin, signer } = payload;

  const getTitle = () => {
    switch (sign_type) {
      case "tx":
        return "Sign Solana Transaction";
      case "message":
        return "Sign Message";
      case "all_tx":
        return "Sign Multiple Transactions";
      default:
        return "Sign Request";
    }
  };

  const getDescription = () => {
    switch (sign_type) {
      case "tx":
        return "You are about to sign a Solana transaction.";
      case "message":
        return "You are about to sign an arbitrary message.";
      case "all_tx":
        return `You are about to sign ${(data.payload.data as any).serialized_transactions?.length || 0} transactions.`;
      default:
        return "Review the details below before signing.";
    }
  };

  return (
    <div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--fg-primary)",
          textAlign: "center",
        }}
      >
        {getTitle()}
      </div>

      <Spacing height={8} />

      <div
        style={{
          fontSize: "14px",
          color: "var(--fg-secondary)",
          textAlign: "center",
        }}
      >
        {getDescription()}
      </div>

      <Spacing height={20} />

      <MetadataContent
        origin={origin}
        signer={signer}
        chainInfo={{
          chain_name: "Solana",
          chain_symbol_image_url:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        }}
      />

      <Spacing height={16} />

      {sign_type === "message" && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "monospace",
            wordBreak: "break-all",
            color: "var(--fg-secondary)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--fg-tertiary)",
              marginBottom: "8px",
            }}
          >
            Message (hex)
          </div>
          {(data.payload.data as any).message}
        </div>
      )}

      {sign_type === "tx" && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
            fontSize: "13px",
            color: "var(--fg-secondary)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--fg-tertiary)",
              marginBottom: "8px",
            }}
          >
            Transaction
          </div>
          <div style={{ fontSize: "12px" }}>
            {(data.payload.data as any).is_versioned
              ? "Versioned Transaction"
              : "Legacy Transaction"}
          </div>
        </div>
      )}

      {sign_type === "all_tx" && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
            fontSize: "13px",
            color: "var(--fg-secondary)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--fg-tertiary)",
              marginBottom: "8px",
            }}
          >
            Transactions
          </div>
          <div style={{ fontSize: "12px" }}>
            {(data.payload.data as any).serialized_transactions?.length || 0}{" "}
            transaction(s) to sign
          </div>
        </div>
      )}
    </div>
  );
};

export interface SolSignatureContentProps {
  data: MakeSolanaSigData;
}
