import type { FC, ReactNode } from "react";

import { ERC20Approve } from "./erc20_approve/erc20_approve";
import { ERC20Permit } from "./erc20_permit/erc20_permit";
import { ERC20Transfer } from "./erc20_transfer/erc20_transfer";
import { ERC20TransferFrom } from "./erc20_transfer_from/erc20_transfer_from";
import { FallbackAction } from "./fallback/fallback_action";
import { NativeTransfer } from "./native_transfer/native_transfer";
import type { EthTxAction, RenderContext } from "./types";
import { Unknown } from "./unknown/unknown";
import { Collapsible } from "@oko-wallet-attached/components/collapsible/collapsible";
import { CollapsibleList } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";

type TxRendererProps = {
  actions: EthTxAction[] | null;
  context?: RenderContext;
};

function getActionKey(action: EthTxAction, index: number): string {
  return `${action.kind}-${index}`;
}

function getActionTitle(action: EthTxAction): string {
  switch (action.kind) {
    case "native.transfer":
      return "Transfer";
    case "erc20.transfer":
      return "Token Transfer";
    case "erc20.approve":
      return "Token Approve";
    case "erc20.transferFrom":
      return "Token TransferFrom";
    case "erc20.permit":
      return "Token Permit";
    case "unknown":
      return action.title || "Unknown";
    default:
      return "Unknown";
  }
}

function renderActionContent(
  action: EthTxAction,
  ctx?: RenderContext,
): ReactNode {
  switch (action.kind) {
    case "native.transfer":
      return <NativeTransfer action={action} ctx={ctx} />;
    case "erc20.transfer":
      return <ERC20Transfer action={action} ctx={ctx} />;
    case "erc20.approve":
      return <ERC20Approve action={action} ctx={ctx} />;
    case "erc20.transferFrom":
      return <ERC20TransferFrom action={action} ctx={ctx} />;
    case "erc20.permit":
      return <ERC20Permit action={action} ctx={ctx} />;
    case "unknown":
      return <Unknown action={action} ctx={ctx} />;
    default:
      return <FallbackAction action={action} ctx={ctx} />;
  }
}

export const Actions: FC<TxRendererProps> = ({ actions, context }) => {
  if (context?.isLoading) {
    return (
      <CollapsibleList
        items={[]}
        getKey={() => "loading"}
        getTitle={() => "Loading"}
        renderContent={() => null}
        isLoading={true}
      />
    );
  }

  if (!actions) {
    return (
      <Collapsible title="Unknown" size="xs">
        <Unknown
          action={{ kind: "unknown", title: "Unknown transaction" }}
          ctx={context}
        />
      </Collapsible>
    );
  }

  return (
    <CollapsibleList
      items={actions}
      getKey={getActionKey}
      getTitle={getActionTitle}
      renderContent={(action) => renderActionContent(action, context)}
    />
  );
};
