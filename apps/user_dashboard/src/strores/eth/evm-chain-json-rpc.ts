import {
  ChainGetter,
  HasMapStore,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";

export class ObservableEvmChainJsonRpcQuery<
  T = unknown,
  E = unknown,
> extends ObservableJsonRPCQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    method: string,
    params?: unknown[] | Record<string, unknown>,
  ) {
    const chainInfo = chainGetter.getModularChain(chainId);

    super(
      sharedContext,
      "evm" in chainInfo && chainInfo.evm != null ? chainInfo.evm.rpc : "",
      "",
      method,
      params,
    );

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  // Note: stores-eth 패키지에서 EthereumProvider를 사용하던 것인데 직접 fetch하도록 변경함. 이거 하나 때문에 stores-eth에서 너무 많은 파일을 가져옴. 리팩터링 필요
  protected override async fetchResponse(): Promise<{ headers: any; data: T }> {
    const chainInfo = this.chainGetter.getModularChain(this._chainId);
    const rpcUrl = "evm" in chainInfo ? chainInfo.evm.rpc : "";

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: this.method,
        params: this.params,
        id: 1,
      }),
    });

    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message || "RPC request failed");
    }

    return {
      headers: {},
      data: json.result as T,
    };
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableEvmChainJsonRpcQueryMap<
  T = unknown,
  E = unknown,
> extends HasMapStore<ObservableEvmChainJsonRpcQuery<T, E>> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableEvmChainJsonRpcQuery<T, E>,
  ) {
    super(creater);
  }
}
