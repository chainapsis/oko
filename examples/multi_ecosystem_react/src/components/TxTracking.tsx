export default function TxTracking({
  txHash,
  explorerUrl,
}: {
  txHash: string;
  explorerUrl?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center h-full">
      <div className="h-12 w-12 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <div className="px-4">
        <h3 className="text-2xl font-semibold tracking-tight">
          Tracking transaction…
        </h3>
        <p className="text-xs text-gray-300 mt-3 font-mono break-all whitespace-pre-wrap max-w-full">
          {txHash}
        </p>
      </div>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
        >
          View on explorer
        </a>
      )}
    </div>
  );
}
