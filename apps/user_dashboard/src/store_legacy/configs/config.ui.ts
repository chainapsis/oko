// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import type { FiatCurrency } from "@keplr-wallet/types";

export const CoinGeckoAPIEndPoint =
  process.env["NEXT_PUBLIC_COINGECKO_ENDPOINT"] ||
  "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice =
  process.env["NEXT_PUBLIC_COINGECKO_GETPRICE"] || "/simple/price";
export const CoinGeckoCoinDataByTokenAddress =
  process.env["NEXT_PUBLIC_COINGECKO_COIN_DATA_BY_TOKEN_ADDRESS"] ||
  "/onchain/networks/{coingeckoChainId}/tokens/{contractAddress}";

// 일단 CoinGecko API와 같은 base url을 사용함
export const SkipTokenInfoBaseURL =
  process.env["NEXT_PUBLIC_COINGECKO_ENDPOINT"] || "";
export const SkipTokenInfoAPIURI =
  process.env["NEXT_PUBLIC_SKIP_TOKEN_INFO_API_URI"] ||
  "/coingecko-token-info/skip/assets/{chainId}/{coinMinimalDenom}";

export const TokenContractListURL =
  "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws";

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["NEXT_PUBLIC_ETHEREUM_ENDPOINT"] || "";

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  {
    currency: "eur",
    symbol: "€",
    maxDecimals: 2,
    locale: "de-DE",
  },
  {
    currency: "gbp",
    symbol: "£",
    maxDecimals: 2,
    locale: "en-GB",
  },
  {
    currency: "cad",
    symbol: "CA$",
    maxDecimals: 2,
    locale: "en-CA",
  },
  {
    currency: "aud",
    symbol: "AU$",
    maxDecimals: 2,
    locale: "en-AU",
  },
  {
    currency: "rub",
    symbol: "₽",
    maxDecimals: 0,
    locale: "ru",
  },
  {
    currency: "krw",
    symbol: "₩",
    maxDecimals: 0,
    locale: "ko-KR",
  },
  {
    currency: "hkd",
    symbol: "HK$",
    maxDecimals: 1,
    locale: "en-HK",
  },
  {
    currency: "cny",
    symbol: "¥",
    maxDecimals: 1,
    locale: "zh-CN",
  },
  {
    currency: "jpy",
    symbol: "¥",
    maxDecimals: 0,
    locale: "ja-JP",
  },
  {
    currency: "inr",
    symbol: "₹",
    maxDecimals: 1,
    locale: "en-IN",
  },
  {
    currency: "chf",
    symbol: "₣",
    maxDecimals: 2,
    locale: "gsw",
  },
  {
    currency: "pkr",
    symbol: "Rs",
    maxDecimals: 0,
    locale: "en-PK",
  },
];
