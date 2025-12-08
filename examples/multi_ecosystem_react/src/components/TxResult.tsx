import Button from "./Button";

export default function TxResult({
  success,
  explorerUrl,
  onBack,
}: {
  success: boolean;
  explorerUrl?: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-[240px]">
      <div className="flex flex-col items-center justify-center gap-6 text-center flex-1">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            success
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {success ? (
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">
          {success ? "Transaction confirmed" : "Transaction failed"}
        </h3>
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
      <Button fullWidth onClick={onBack}>
        Try again
      </Button>
    </div>
  );
}
