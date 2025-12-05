import { autorun, computed, flow, makeObservable, observable } from "mobx";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainStore as BaseChainStore } from "./base";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ModularChainInfo } from "./chain-info";

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _isInitializing: boolean = false;

  @observable.ref
  protected _enabledChainIdentifiers: string[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: (ModularChainInfo | ChainInfo)[],
  ) {
    super(
      embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          ...{
            embedded: true,
          },
        };
      }),
    );

    // Should be enabled at least one chain.
    this._enabledChainIdentifiers = [
      ChainIdHelper.parse(embedChainInfos[0].chainId).identifier,
    ];

    makeObservable(this);

    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  async waitUntilInitialized(): Promise<void> {
    if (!this.isInitializing) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (!this.isInitializing) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  @computed
  protected get enabledChainIdentifiesMap(): Map<string, true> {
    if (this._enabledChainIdentifiers.length === 0) {
      // Should be enabled at least one chain.
      const map = new Map<string, true>();
      map.set(
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier,
        true,
      );
      return map;
    }

    const map = new Map<string, true>();
    for (const chainIdentifier of this._enabledChainIdentifiers) {
      map.set(chainIdentifier, true);
    }
    return map;
  }

  @computed
  override get modularChainInfos(): ModularChainInfo[] {
    // Sort by chain name.
    // The first chain has priority to be the first.
    return super.modularChainInfos.sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(a.chainId).identifier;
      const bChainIdentifier = ChainIdHelper.parse(b.chainId).identifier;

      if (
        aChainIdentifier ===
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier
      ) {
        return -1;
      }
      if (
        bChainIdentifier ===
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier
      ) {
        return 1;
      }

      return a.chainName.trim().localeCompare(b.chainName.trim());
    });
  }

  /**
   * Group modular chain infos by linked chain ids.
   * For example, bitcoin has separated chain for native segwit and taproot,
   * but they have to be shown as a same chain in some cases.
   *
   * @returns Grouped modular chain infos.
   */
  @computed
  get groupedModularChainInfos(): (ModularChainInfo & {
    linkedModularChainInfos?: ModularChainInfo[];
  })[] {
    const linkedChainInfosByChainKey = new Map<string, ModularChainInfo[]>();
    const groupedModularChainInfos: (ModularChainInfo & {
      linkedModularChainInfos?: ModularChainInfo[];
    })[] = [];

    for (const modularChainInfo of this.modularChainInfos) {
      if ("linkedChainKey" in modularChainInfo) {
        const linkedChainKey = modularChainInfo.linkedChainKey;
        const linkedChainInfos = linkedChainInfosByChainKey.get(linkedChainKey);
        if (linkedChainInfos) {
          linkedChainInfos.push(modularChainInfo);
        } else {
          linkedChainInfosByChainKey.set(linkedChainKey, [modularChainInfo]);
        }
      } else {
        groupedModularChainInfos.push(modularChainInfo);
      }
    }

    for (const linkedChainInfos of linkedChainInfosByChainKey.values()) {
      // 하나의 체인 키에 여러개의 체인이 연결되어 있으면 하나의 체인만 남기고 나머지는 버린다
      // CHECK: 어떤 것이 primary 체인인지 결정할 필요가 있는지? 우선 첫번째 체인을 primary로 설정
      if (linkedChainInfos.length > 1) {
        groupedModularChainInfos.push({
          ...linkedChainInfos[0],
          linkedModularChainInfos: linkedChainInfos.slice(1),
        });
      }
    }

    return groupedModularChainInfos;
  }

  get enabledChainIdentifiers(): string[] {
    return this._enabledChainIdentifiers;
  }

  @computed
  get modularChainInfosInUI() {
    return this.modularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }
      const chainIdentifier = ChainIdHelper.parse(
        modularChainInfo.chainId,
      ).identifier;

      return this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
  }

  @computed
  get groupedModularChainInfosInUI() {
    return this.groupedModularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      const chainIdentifier = ChainIdHelper.parse(
        modularChainInfo.chainId,
      ).identifier;

      return this.enabledChainIdentifiesMap.get(chainIdentifier);
    });
  }

  // chain info들을 list로 보여줄때 hideInUI인 얘들은 빼고 보여줘야한다
  // property 이름이 얘매해서 일단 이렇게 지었다.

  @computed
  get modularChainInfosInListUI() {
    return this.modularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      return true;
    });
  }

  @computed
  get groupedModularChainInfosInListUI() {
    return this.groupedModularChainInfos.filter((modularChainInfo) => {
      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos.hideInUI) {
        return false;
      }

      return true;
    });
  }

  isEnabledChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    return this.enabledChainIdentifiesMap.get(chainIdentifier) === true;
  }

  @computed
  protected get modularChainInfosInListUIMap(): Map<string, true> {
    const map = new Map<string, true>();
    for (const chainInfo of this.modularChainInfosInListUI) {
      map.set(ChainIdHelper.parse(chainInfo.chainId).identifier, true);
    }
    return map;
  }

  isInModularChainInfosInListUI(chainId: string): boolean {
    return (
      this.modularChainInfosInListUIMap.get(
        ChainIdHelper.parse(chainId).identifier,
      ) === true
    );
  }

  @flow
  *enableChainInfoInUI(...chainIds: string[]) {
    const newIdentifiers = new Set(this._enabledChainIdentifiers);

    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      newIdentifiers.add(identifier);
    }

    this._enabledChainIdentifiers = Array.from(newIdentifiers);

    yield this.kvStore.set(
      "enabledChainIdentifiers",
      this._enabledChainIdentifiers,
    );
  }

  @flow
  *disableChainInfoInUI(...chainIds: string[]) {
    const newIdentifiers = new Set(this._enabledChainIdentifiers);

    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      newIdentifiers.delete(identifier);
    }

    // Ensure at least one chain is enabled
    if (newIdentifiers.size === 0) {
      newIdentifiers.add(
        ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier,
      );
    }

    this._enabledChainIdentifiers = Array.from(newIdentifiers);

    yield this.kvStore.set(
      "enabledChainIdentifiers",
      this._enabledChainIdentifiers,
    );
  }

  @flow
  protected *init() {
    this._isInitializing = true;

    const savedEnabledChains = yield* toGenerator(
      this.kvStore.get<string[]>("enabledChainIdentifiers"),
    );

    if (savedEnabledChains && savedEnabledChains.length > 0) {
      this._enabledChainIdentifiers = savedEnabledChains;
    }

    this._isInitializing = false;
  }
}
