import { TransactionReceipt } from "viem";
import {
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { useCopyToClipboard } from "@oko-wallet-sandbox-evm/hooks/scaffold-eth/useCopyToClipboard";
import { useTargetNetwork } from "@oko-wallet-sandbox-evm/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerTxLink } from "@oko-wallet-sandbox-evm/utils/scaffold-eth";

export const TxReceipt = ({ txResult }: { txResult: TransactionReceipt }) => {
  const { targetNetwork } = useTargetNetwork();
  const {
    copyToClipboard: copyTxHashToClipboard,
    isCopiedToClipboard: isTxHashCopiedToClipboard,
  } = useCopyToClipboard();

  const txHash = txResult.transactionHash;
  const explorerTxURL = targetNetwork?.blockExplorers?.default?.url
    ? `${targetNetwork.blockExplorers.default.url}/tx/${txHash}`
    : `https://etherscan.io/tx/${txHash}`;

  return (
    <div className="flex flex-col gap-3 p-4 bg-base-100 border border-base-300 rounded-lg shadow-sm w-full max-w-full">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full"></div>
        <span className="text-sm font-medium text-success">
          Transaction Successful
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-base-content/70">Hash:</span>
        <code className="font-mono text-xs bg-base-200 px-2 py-1 rounded flex-1 min-w-0 overflow-hidden text-ellipsis">
          {txHash}
        </code>
        <button
          onClick={() => copyTxHashToClipboard(txHash)}
          className="btn btn-ghost btn-xs"
          title="Copy transaction hash"
        >
          {isTxHashCopiedToClipboard ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <DocumentDuplicateIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <a
        href={explorerTxURL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-info hover:text-info/80 transition-colors"
      >
        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        View on Block Explorer
      </a>
    </div>
  );
};
