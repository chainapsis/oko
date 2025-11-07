import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import { sha256 } from "@oko-wallet/crypto-js";
import type { Result } from "@oko-wallet/stdlib-js";

export async function hashKeyshareNodeNames(
  keyshareNodeNames: string[],
): Promise<Result<Bytes32[], string>> {
  const hashes = [];
  for (const name of keyshareNodeNames) {
    const hash = sha256(name);
    const hashU8Arr = new Uint8Array(hash);
    // 1 bytes prefix for compatibility with a range of a secret key(0, n);
    // n is the order of a elliptic curve
    // this hash has 31 bytes(248 bits) as a entropy.
    hashU8Arr[0] = 0;
    const bytesRes = Bytes.fromUint8Array(hashU8Arr, 32);
    if (bytesRes.success === false) {
      return {
        success: false,
        err: bytesRes.err,
      };
    }
    hashes.push(bytesRes.data);
  }

  return {
    success: true,
    data: hashes,
  };
}
