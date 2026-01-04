import type { OkoWalletInterface } from "@oko-wallet/oko-sdk-core";
import { PublicKey } from "@solana/web3.js";

import type {
  OkoSolWalletInterface,
  OkoSolWalletInternal,
  OkoSolWalletStaticInterface,
} from "./types";
import { SolWalletEventEmitter } from "./emitter";
import { lazyInit } from "./private/lazy_init";

export const OkoSolWallet = function (
  this: OkoSolWalletInternal,
  okoWallet: OkoWalletInterface,
) {
  this.okoWallet = okoWallet;
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
  };
  this.publicKey = null;
  this.connecting = false;
  this.connected = false;

  this._emitter = new SolWalletEventEmitter();
  this.on = this._emitter.on.bind(this._emitter) as OkoSolWalletInterface["on"];
  this.off = this._emitter.off.bind(
    this._emitter,
  ) as OkoSolWalletInterface["off"];

  okoWallet.on({
    type: "CORE__accountsChanged",
    handler: (payload) => {
      const previousPublicKeyRaw = this.state.publicKeyRaw;

      if (payload.publicKey === null) {
        this.state.publicKey = null;
        this.state.publicKeyRaw = null;
        this.publicKey = null;
        this.connected = false;
        this._emitter.emit("accountChanged", null);
      } else if (payload.publicKey !== previousPublicKeyRaw) {
        const publicKeyBytes = Buffer.from(payload.publicKey, "hex");
        const newPublicKey = new PublicKey(publicKeyBytes);

        this.state.publicKey = newPublicKey;
        this.state.publicKeyRaw = payload.publicKey;
        this.publicKey = newPublicKey;
        this.connected = true;
        this._emitter.emit("accountChanged", newPublicKey);
      }
    },
  });

  this.waitUntilInitialized = lazyInit(this);
} as unknown as OkoSolWalletStaticInterface;
