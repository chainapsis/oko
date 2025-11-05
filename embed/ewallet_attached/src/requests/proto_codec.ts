import { TX_INTERPRETER_API_ENDPOINT } from "./endpoints";

const BASE_URL = TX_INTERPRETER_API_ENDPOINT;

const getTxInterpreterURL = (currentChainPrefix: string) => {
  switch (currentChainPrefix) {
    case "agoric":
      return `${BASE_URL}/agoric`;
    case "atone":
      return `${BASE_URL}/atomone`;
    case "akash":
      return `${BASE_URL}/akash`;
    case "axelar":
      return `${BASE_URL}/axelar`;
    case "bbn":
      return `${BASE_URL}/babylon`;
    case "bostrom":
      return `${BASE_URL}/bostrom`;
    case "celestia":
      return `${BASE_URL}/celestia`;
    case "chihuahua":
      return `${BASE_URL}/chihuahua`;
    case "cosmos":
      return `${BASE_URL}/cosmoshub`;
    case "cro":
      return `${BASE_URL}/cryptoorgchain`;
    case "dydx":
      return `${BASE_URL}/dydx`;
    case "elys":
      return `${BASE_URL}/elys`;
    case "iaa":
      return `${BASE_URL}/irisnet`;
    case "jkl":
      return `${BASE_URL}/jackal`;
    case "juno":
      return `${BASE_URL}/juno`;
    case "kava":
      return `${BASE_URL}/kava`;
    case "kyve":
      return `${BASE_URL}/kyve`;
    case "lava@":
      return `${BASE_URL}/lava`;
    case "like":
      return `${BASE_URL}/likecoin`;
    case "milk":
      return `${BASE_URL}/milkyway`;
    case "mantra":
      return `${BASE_URL}/mantra`;
    case "neutron":
      return `${BASE_URL}/neutron`;
    case "nillion":
      return `${BASE_URL}/nillion`;
    case "noble":
      return `${BASE_URL}/noble`;
    case "nolus":
      return `${BASE_URL}/nolus`;
    case "omniflix":
      return `${BASE_URL}/omniflix`;
    case "osmo":
      return `${BASE_URL}/osmosis`;
    case "pasg":
      return `${BASE_URL}/passage`;
    case "persistence":
      return `${BASE_URL}/persistence`;
    case "pokt":
      return `${BASE_URL}/pocket`;
    case "pryzm":
      return `${BASE_URL}/pryzm`;
    case "quick":
      return `${BASE_URL}/quicksilver`;
    case "regen":
      return `${BASE_URL}/regen`;
    case "saga":
      return `${BASE_URL}/saga`;
    case "secret":
      return `${BASE_URL}/secretnetwork`;
    case "seda":
      return `${BASE_URL}/seda`;
    case "sent":
      return `${BASE_URL}/sentinel`;
    case "somm":
      return `${BASE_URL}/sommelier`;
    case "stars":
      return `${BASE_URL}/stargaze`;
    case "stride":
      return `${BASE_URL}/stride`;
    case "terra":
      return `${BASE_URL}/terra2`;
    case "thor":
      return `${BASE_URL}/thorchain`;
    case "umee":
      return `${BASE_URL}/umee`;
    case "union":
      return `${BASE_URL}/union`;
    case "xion":
      return `${BASE_URL}/xion`;
    default:
      return "";
  }
};

const DEFAULT_URL = `${BASE_URL}/cosmoshub`;
const COMMON_MSG_TYPE_URLS = [
  "/cosmos.bank.v1beta1.MsgSend",
  "/cosmos.gov.v1beta1.MsgVote",
];

export async function postRawJSONFromProtoMsgs(
  chainPrefix: string,
  messages: { typeUrl: string; value: string }[],
): Promise<{ result: { messages: any[] } }> {
  const url = getTxInterpreterURL(chainPrefix);
  const canUseDefaultURL = COMMON_MSG_TYPE_URLS.every((typeUrl) =>
    messages.some((msg) => msg.typeUrl === typeUrl),
  );
  const targetUrl = url !== "" ? url : canUseDefaultURL ? DEFAULT_URL : "";

  if (targetUrl === "") {
    return {
      result: {
        messages: messages,
      },
    };
  }

  try {
    const response = await fetch(`${targetUrl}/tx/proto-to-raw-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${targetUrl}/tx/proto-to-raw-json: ${response.status} ${response.statusText || "Unknown Error"}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[Error] postRawJSONFromProtoMsgs", error);

    return {
      result: {
        messages: messages,
      },
    };
  }
}
