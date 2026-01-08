/**
 * Common utilities for Sign In With X (SIWE/SIWS) message verification
 */

export const ALLOW_PROTOCOLS = ["https:"];
export const BYPASS_HOSTS = ["localhost"];

/**
 * Verify that the sign-in message origin matches the request origin
 */
export function verifySignInOrigin(
  domain: string,
  uri: string | undefined,
  origin: string,
): boolean {
  try {
    const {
      origin: originByPayload,
      protocol: protocolByPayload,
      host: hostByPayload,
    } = new URL(origin);

    // Check domain matches
    if (hostByPayload !== domain) {
      return false;
    }

    // Check URI if provided
    if (uri) {
      const { origin: originByUri, protocol: protocolByUri } = new URL(uri);

      if (originByPayload !== originByUri) {
        return false;
      }

      // If scheme is not HTTPS, return false (when hostname is not localhost)
      if (
        !BYPASS_HOSTS.includes(hostByPayload.split(":")[0]) &&
        (!ALLOW_PROTOCOLS.includes(protocolByPayload) ||
          !ALLOW_PROTOCOLS.includes(protocolByUri))
      ) {
        return false;
      }
    } else {
      // No URI, just check protocol
      if (
        !BYPASS_HOSTS.includes(hostByPayload.split(":")[0]) &&
        !ALLOW_PROTOCOLS.includes(protocolByPayload)
      ) {
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}
