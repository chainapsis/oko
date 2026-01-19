import type { Point256 } from "@oko-wallet/oko-types/user_key_share";
import { Bytes } from "@oko-wallet/bytes";
import type { Result } from "@oko-wallet/stdlib-js";

export function decodeKeyShareStringToPoint256(
  keyShare: string,
): Result<Point256, string> {
  if (keyShare.length !== 128) {
    return {
      success: false,
      err: "Key share must be 128 characters(64 bytes) long",
    };
  }

  const x = Bytes.fromHexString(keyShare.slice(0, 64), 32);
  if (x.success === false) {
    return {
      success: false,
      err: x.err,
    };
  }
  const y = Bytes.fromHexString(keyShare.slice(64, 128), 32);
  if (y.success === false) {
    return {
      success: false,
      err: y.err,
    };
  }
  return {
    success: true,
    data: { x: x.data, y: y.data },
  };
}

export function encodePoint256ToKeyShareString(point: Point256): string {
  return `${point.x.toHex()}${point.y.toHex()}`;
}
