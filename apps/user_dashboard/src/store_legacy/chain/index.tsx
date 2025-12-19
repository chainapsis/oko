import { autorun, computed, flow, makeObservable, observable } from "mobx";
import type { ChainInfo } from "@keplr-wallet/types";
import type { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { type KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import type { OAuthProvider } from "@oko-wallet/oko-types/auth";

import { ChainStore as BaseChainStore } from "./base";
import { type ModularChainInfo } from "./chain-info";

type UserKey = `${OAuthProvider}/${string}`;

const CHAIN_INFO_ENDPOINT = "https://keplr-api.keplr.app/v1/chains";
const DEFAULT_ENABLED_CHAIN_IDENTIFIERS = [
  "cosmoshub",
  "osmosis",
  "eip155:1",
] as const;
const KVSTORE_KEY_ENABLED_CHAINS_BY_USER_KEY =
  "enabledChainIdentifiersByUserKey";

function createUserKey(params: {
  authType: OAuthProvider;
  email: string;
}): UserKey {
  return `${params.authType}/${params.email.trim()}`;
}

export class ChainStore extends BaseChainStore<ChainInfoWithCoreTypes> {
  @observable
  protected _isInitializing: boolean = false;

  @observable.ref
  protected _enabledChainIdentifiersByUserKey: Record<string, string[]> = {};

  @observable
  protected _activeUserKey: UserKey | null = null;

  protected _hasLoadedEnabledChainsByUserKeyFromStorage: boolean = false;

  @observable.ref
  protected _chainInfosFromAPI: (ModularChainInfo | ChainInfo)[] = [];

  constructor(protected readonly kvStore: KVStore) {
    super([]);

    makeObservable(this);

    this.init();
  }

  protected get embedChainInfos(): (ModularChainInfo | ChainInfo)[] {
    return this._chainInfosFromAPI;
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
    const enabledChainIdentifiers = this.enabledChainIdentifiers;

    const identifiersToMap =
      enabledChainIdentifiers.length > 0
        ? enabledChainIdentifiers
        : this.getFallbackEnabledChainIdentifiers();
    const map = new Map<string, true>();
    for (const chainIdentifier of identifiersToMap) {
      map.set(chainIdentifier, true);
    }
    return map;
  }

  private getFallbackEnabledChainIdentifiers(): string[] {
    if (this.embedChainInfos.length > 0) {
      return [ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier];
    }

    return [DEFAULT_ENABLED_CHAIN_IDENTIFIERS[0]];
  }

  @computed
  override get modularChainInfos(): ModularChainInfo[] {
    // Sort by chain name.
    // The first chain has priority to be the first.
    const firstChainIdentifier =
      this.embedChainInfos.length > 0
        ? ChainIdHelper.parse(this.embedChainInfos[0].chainId).identifier
        : null;
    return super.modularChainInfos.sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(a.chainId).identifier;
      const bChainIdentifier = ChainIdHelper.parse(b.chainId).identifier;

      if (firstChainIdentifier) {
        if (aChainIdentifier === firstChainIdentifier) {
          return -1;
        }
        if (bChainIdentifier === firstChainIdentifier) {
          return 1;
        }
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
    const activeUserKey = this._activeUserKey;
    if (!activeUserKey) {
      return Array.from(DEFAULT_ENABLED_CHAIN_IDENTIFIERS);
    }

    const identifiers = this._enabledChainIdentifiersByUserKey[activeUserKey];
    if (identifiers && identifiers.length > 0) {
      return identifiers;
    }

    return Array.from(DEFAULT_ENABLED_CHAIN_IDENTIFIERS);
  }

  @flow
  *setActiveUserKey(userKey: UserKey | null) {
    this._activeUserKey = userKey;
    if (!userKey) {
      return;
    }

    if (!this._hasLoadedEnabledChainsByUserKeyFromStorage) {
      const savedEnabledChainsByUserKey = yield* toGenerator(
        this.kvStore.get<Record<string, string[]>>(
          KVSTORE_KEY_ENABLED_CHAINS_BY_USER_KEY,
        ),
      );
      if (savedEnabledChainsByUserKey) {
        this._enabledChainIdentifiersByUserKey = {
          ...savedEnabledChainsByUserKey,
          ...this._enabledChainIdentifiersByUserKey,
        };
      }

      this._hasLoadedEnabledChainsByUserKeyFromStorage = true;
    }
  }

  setActiveUser(params: { authType: OAuthProvider; email: string }) {
    this.setActiveUserKey(createUserKey(params));
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
    const activeUserKey = this._activeUserKey;
    if (!activeUserKey) {
      console.error("Active user key is not set, cannot enable chain in UI");
      return;
    }

    const currentIdentifiers =
      this._enabledChainIdentifiersByUserKey[activeUserKey] ??
      Array.from(DEFAULT_ENABLED_CHAIN_IDENTIFIERS);

    const newIdentifiers = new Set(currentIdentifiers);

    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      newIdentifiers.add(identifier);
    }

    const nextEnabledChainIdentifiers = Array.from(newIdentifiers);
    this._enabledChainIdentifiersByUserKey = {
      ...this._enabledChainIdentifiersByUserKey,
      [activeUserKey]: nextEnabledChainIdentifiers,
    };

    yield this.kvStore.set(
      KVSTORE_KEY_ENABLED_CHAINS_BY_USER_KEY,
      this._enabledChainIdentifiersByUserKey,
    );
  }

  @flow
  *disableChainInfoInUI(...chainIds: string[]) {
    const activeUserKey = this._activeUserKey;
    if (!activeUserKey) {
      console.error("Active user key is not set, cannot disable chain in UI");
      return;
    }

    const currentIdentifiers =
      this._enabledChainIdentifiersByUserKey[activeUserKey] ??
      Array.from(DEFAULT_ENABLED_CHAIN_IDENTIFIERS);

    const newIdentifiers = new Set(currentIdentifiers);

    for (const chainId of chainIds) {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      newIdentifiers.delete(identifier);
    }

    // Ensure at least one chain is enabled
    if (newIdentifiers.size === 0) {
      const fallbackIdentifier = this.getFallbackEnabledChainIdentifiers()[0];
      newIdentifiers.add(fallbackIdentifier);
    }

    const nextEnabledChainIdentifiers = Array.from(newIdentifiers);
    this._enabledChainIdentifiersByUserKey = {
      ...this._enabledChainIdentifiersByUserKey,
      [activeUserKey]: nextEnabledChainIdentifiers,
    };

    yield this.kvStore.set(
      KVSTORE_KEY_ENABLED_CHAINS_BY_USER_KEY,
      this._enabledChainIdentifiersByUserKey,
    );
  }

  @flow
  protected *init() {
    this._isInitializing = true;

    const savedEnabledChainsByUserKey = yield* toGenerator(
      this.kvStore.get<Record<string, string[]>>(
        KVSTORE_KEY_ENABLED_CHAINS_BY_USER_KEY,
      ),
    );
    if (savedEnabledChainsByUserKey) {
      this._enabledChainIdentifiersByUserKey = {
        ...savedEnabledChainsByUserKey,
        ...this._enabledChainIdentifiersByUserKey,
      };
    }

    this._hasLoadedEnabledChainsByUserKeyFromStorage = true;

    try {
      const response = yield* toGenerator(fetch(CHAIN_INFO_ENDPOINT));
      const data = yield* toGenerator(
        response.json() as Promise<{ chains: ChainInfo[] }>,
      );

      if (data.chains && data.chains.length > 0) {
        this._chainInfosFromAPI = data.chains;

        // Update base chain store with fetched chain infos
        this.setEmbeddedChainInfos(
          data.chains.map((chainInfo: ChainInfo) => ({
            ...chainInfo,
            embedded: true,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch chain infos from Keplr API:", error);
    }

    this._isInitializing = false;
  }
}
