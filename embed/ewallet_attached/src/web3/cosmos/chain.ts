// VersionFormatRegExp checks if a chainID is in the format required for parsing versions
// The chainID should be in the form: `{identifier}-{version}`
const VersionFormatRegExp = /(.+)-([\d]+)/;

// @deprecated
export function getChainIdentifier(chainId: string) {
  // In the case of injective dev/testnet, there is a difficult problem to deal with keplr's chain identifier system...
  // Fundamentally, keplr's chain identifier system started when the app was created, so too mnay logic depends on chain identifier.
  // Temporarily deal with it in the way below.
  // There is a possibility of some kind of problem...
  // But anyway, it's not a big problem because it's dev/testnet...
  if (chainId === "injective-777" || chainId === "injective-888") {
    return chainId;
  }

  const split = chainId.split(VersionFormatRegExp).filter(Boolean);
  if (split.length !== 2) {
    return chainId;
  } else {
    return split[0];
  }
}
