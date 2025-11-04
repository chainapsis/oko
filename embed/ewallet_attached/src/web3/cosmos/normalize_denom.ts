export function normalizeIBCDenom(denom: string): string {
  if (denom.startsWith("ibc/")) {
    //NOTE - ibc prefix is need to be lower case
    return denom.slice(0, 4) + denom.slice(4).toUpperCase();
  }
  return denom;
}
