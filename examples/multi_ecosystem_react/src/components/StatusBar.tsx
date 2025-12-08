import useCosmos from "@/oko/useCosmos";
import useEvm from "@/oko/useEvm";
import CopyableAddress from "./CopyableAddress";
import CosmosBalance from "./CosmosBalance";
import EvmBalance from "./EvmBalance";

function StatusBar() {
  const { bech32Address } = useCosmos();
  const { address } = useEvm();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-widget border border-widget-border rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">
          Cosmos{" "}
          <span className="text-sm text-gray-300">(Osmosis Testnet)</span>
        </h3>
        {bech32Address ? (
          <CopyableAddress value={bech32Address} />
        ) : (
          <div className="text-sm opacity-70">-</div>
        )}
        <CosmosBalance />
      </div>
      <div className="bg-widget border border-widget-border rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">
          EVM <span className="text-sm text-gray-300">(Ethereum Sepolia)</span>
        </h3>
        {address ? (
          <CopyableAddress value={address} />
        ) : (
          <div className="text-sm opacity-70">-</div>
        )}
        <EvmBalance />
      </div>
    </div>
  );
}

export default StatusBar;
