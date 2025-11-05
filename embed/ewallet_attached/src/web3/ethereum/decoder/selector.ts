import type { Hex } from "viem";

export type FetchFunctionInterfaceOpenApi = {
  ok: boolean;
  result: {
    function: Record<
      string,
      | {
          name: string;
          filtered: boolean;
        }[]
      | undefined
    >;
    event: Record<
      string,
      | {
          name: string;
          filtered: boolean;
        }[]
      | undefined
    >;
  };
};

export async function fetchFunctionFromOpenchain({
  selector,
}: {
  selector: Hex;
}): Promise<FetchFunctionInterfaceOpenApi["result"]["function"][Hex] | null> {
  try {
    const requestUrl = new URL(
      "https://api.openchain.xyz/signature-database/v1/lookup",
    );
    // auto filter junk results
    requestUrl.searchParams.append("function", selector);
    const response = await fetch(requestUrl);
    const data = (await response.json()) as FetchFunctionInterfaceOpenApi;
    if (!data.ok) {
      throw new Error(
        `Openchain API failed to find function interface with selector ${selector}`,
      );
    }
    return data.result.function[selector];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type FetchFunctionInterface4Byte = {
  count: number;
  results: {
    id: number;
    created_at: string;
    text_signature: string;
    hex_signature: string;
  }[];
};

export async function fetchFunctionFrom4Bytes({
  selector,
}: {
  selector: Hex;
}): Promise<FetchFunctionInterface4Byte["results"] | null> {
  try {
    const requestUrl = new URL(
      "https://www.4byte.directory/api/v1/signatures/",
    );
    requestUrl.searchParams.append("hex_signature", selector);
    const response = await fetch(requestUrl);
    const data = (await response.json()) as FetchFunctionInterface4Byte;
    if (data.count === 0) {
      throw new Error(
        `4bytes API failed to find function interface with selector ${selector}`,
      );
    }
    return data.results;
  } catch (error) {
    console.error(error);
    return null;
  }
}
