import { makeAutoObservable, observable, action, runInAction } from "mobx";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";

/**
 * MobX store that caches addresses fetched from Zustand SDK state.
 * Addresses are fetched once per chainId and cached until SDK changes.
 * (Batching is used to reduce duplicate API requests to the SDK.)
 */
export class OkoWalletAddressStore {
  // cached bech32 addresses (undefined is also considered as fetched)
  @observable.shallow
  protected bech32AddressCache = new Map<string, string | undefined>();

  protected pendingBech32 = new Set<string>();
  protected pendingEth = false;

  protected bech32BatchQueue = new Set<string>();
  protected batchTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly BATCH_DELAY_MS = 100;

  @observable
  protected cachedEthAddress: string | undefined = undefined;

  @observable
  protected ethAddressFetched = false;

  constructor() {
    makeAutoObservable(this);

    // Zustand SDK state 변경 시 캐시 초기화
    useSDKState.subscribe((state, prevState) => {
      if (state.oko_cosmos !== prevState.oko_cosmos) {
        this.clearBech32Cache();
      }
      if (state.oko_eth !== prevState.oko_eth) {
        this.clearEthCache();
      }
    });
  }

  getBech32Address(chainId: string): string | undefined {
    if (
      chainId.includes("eip155:") ||
      chainId.includes("bip122:") ||
      chainId.includes("starknet:")
    ) {
      return undefined;
    }

    if (this.bech32AddressCache.has(chainId)) {
      return this.bech32AddressCache.get(chainId);
    }

    if (!this.pendingBech32.has(chainId)) {
      this.queueBech32Fetch(chainId);
    }

    return undefined;
  }

  getEthAddress(): string | undefined {
    if (this.ethAddressFetched) {
      return this.cachedEthAddress;
    }

    if (!this.pendingEth) {
      this.fetchEthAddress();
    }

    return undefined;
  }

  private queueBech32Fetch(chainId: string): void {
    if (
      this.bech32AddressCache.has(chainId) ||
      this.pendingBech32.has(chainId)
    ) {
      return;
    }

    this.bech32BatchQueue.add(chainId);
    this.pendingBech32.add(chainId);

    if (this.batchTimer === null) {
      this.batchTimer = setTimeout(() => {
        this.processBech32Batch();
      }, this.BATCH_DELAY_MS);
    }
  }

  /**
   * 배치 큐에 있는 모든 chainId에 대해 한 번에 주소를 가져옴
   */
  @action
  private async processBech32Batch(): Promise<void> {
    this.batchTimer = null;

    const chainIds = Array.from(this.bech32BatchQueue);
    this.bech32BatchQueue.clear();

    if (chainIds.length === 0) {
      return;
    }

    const okoCosmos = useSDKState.getState().oko_cosmos;
    if (!okoCosmos) {
      // SDK가 없으면 모든 pending을 undefined로 설정
      runInAction(() => {
        for (const chainId of chainIds) {
          this.bech32AddressCache.set(chainId, undefined);
          this.pendingBech32.delete(chainId);
        }
      });
      return;
    }

    // 모든 chainId에 대해 병렬로 요청
    const results = await Promise.allSettled(
      chainIds.map(async (chainId) => {
        try {
          const key = await okoCosmos.getKey(chainId);
          return { chainId, address: key?.bech32Address };
        } catch (error) {
          console.error(
            `Failed to fetch bech32 address for ${chainId}:`,
            error,
          );
          return { chainId, address: undefined };
        }
      }),
    );

    runInAction(() => {
      for (const result of results) {
        if (result.status === "fulfilled") {
          const { chainId, address } = result.value;
          this.bech32AddressCache.set(chainId, address);
          this.pendingBech32.delete(chainId);
        }
      }
    });
  }

  @action
  private async fetchEthAddress(): Promise<void> {
    if (this.pendingEth || this.ethAddressFetched) {
      return;
    }

    this.pendingEth = true;

    try {
      const okoEth = useSDKState.getState().oko_eth;
      const address = await okoEth?.getAddress();

      runInAction(() => {
        this.cachedEthAddress = address;
        this.ethAddressFetched = true;
        this.pendingEth = false;
      });
    } catch (error) {
      console.error("Failed to fetch ETH address:", error);
      runInAction(() => {
        this.cachedEthAddress = undefined;
        this.ethAddressFetched = true;
        this.pendingEth = false;
      });
    }
  }

  @action
  clearBech32Cache(): void {
    this.bech32AddressCache.clear();
    this.pendingBech32.clear();
    this.bech32BatchQueue.clear();
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  @action
  clearEthCache(): void {
    this.cachedEthAddress = undefined;
    this.ethAddressFetched = false;
    this.pendingEth = false;
  }

  @action
  clearAllCache(): void {
    this.clearBech32Cache();
    this.clearEthCache();
  }
}
