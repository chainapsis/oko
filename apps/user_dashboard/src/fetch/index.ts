function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // During SSR/build, env vars might not be available
    // Throw only on client-side where env vars should definitely be set
    if (typeof window !== "undefined") {
      throw new Error(`Environment variable ${key} is not configured`);
    }
    return "";
  }
  return value;
}

export const OKO_API_ENDPOINT = getRequiredEnv("NEXT_PUBLIC_OKO_API_ENDPOINT");
export const KEPLR_API_ENDPOINT = getRequiredEnv(
  "NEXT_PUBLIC_KEPLR_API_ENDPOINT",
);
export const TX_CODEC_BASE_URL = getRequiredEnv(
  "NEXT_PUBLIC_TX_CODEC_BASE_URL",
);
export const TOPUP_BASE_URL = getRequiredEnv("NEXT_PUBLIC_TOPUP_BASE_URL");
export const TX_HISTORY_BASE_URL = getRequiredEnv(
  "NEXT_PUBLIC_TX_HISTORY_BASE_URL",
);
export const COINGECKO_ENDPOINT = getRequiredEnv(
  "NEXT_PUBLIC_COINGECKO_ENDPOINT",
);
export const COINGECKO_GETPRICE = getRequiredEnv(
  "NEXT_PUBLIC_COINGECKO_GETPRICE",
);
export const COINGECKO_COIN_DATA_BY_TOKEN_ADDRESS = getRequiredEnv(
  "NEXT_PUBLIC_COINGECKO_COIN_DATA_BY_TOKEN_ADDRESS",
);
export const SKIP_TOKEN_INFO_API_URI = getRequiredEnv(
  "NEXT_PUBLIC_SKIP_TOKEN_INFO_API_URI",
);
export const ETHEREUM_ENDPOINT = getRequiredEnv(
  "NEXT_PUBLIC_ETHEREUM_ENDPOINT",
);
export const OKO_SDK_API_KEY = getRequiredEnv("NEXT_PUBLIC_OKO_SDK_API_KEY");
export const OKO_SDK_ENDPOINT = getRequiredEnv("NEXT_PUBLIC_OKO_SDK_ENDPOINT");
export const S3_BUCKET_URL = getRequiredEnv("NEXT_PUBLIC_S3_BUCKET_URL");
export const OKO_FEATURE_REQUEST_ENDPOINT = getRequiredEnv(
  "NEXT_PUBLIC_OKO_FEATURE_REQUEST_ENDPOINT",
);
export const OKO_GET_SUPPORT_ENDPOINT = getRequiredEnv(
  "NEXT_PUBLIC_OKO_GET_SUPPORT_ENDPOINT",
);
