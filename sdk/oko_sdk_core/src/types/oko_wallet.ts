import type { Result } from "@oko-wallet/stdlib-js";

import type { EventEmitter3 } from "@oko-wallet-sdk-core/event";
import type { OkoWalletCoreEvent2, OkoWalletCoreEventHandler2 } from "./event";
import type { OkoWalletMsg, OkoWalletMsgOpenModal } from "./msg";
import type { OpenModalAckPayload } from "./modal";
import type {
  OkoWalletInitError,
  OpenModalError,
} from "@oko-wallet-sdk-core/errors";

export interface OkoWalletStaticInterface {
  new (apiKey: string, iframe: HTMLIFrameElement, sdkEndpoint: string): void;
  init: (
    args: OkoWalletInitArgs,
  ) => Result<OkoWalletInterface, OkoWalletInitError>;
}

export interface OkoWalletInterface {
  state: OkoWalletState;
  apiKey: string;
  iframe: HTMLIFrameElement;
  activePopupId: string | null;
  activePopupWindow: Window | null;
  sdkEndpoint: string;
  eventEmitter: EventEmitter3<OkoWalletCoreEvent2, OkoWalletCoreEventHandler2>;
  origin: string;
  waitUntilInitialized: Promise<Result<OkoWalletState, string>>;

  openModal: (
    msg: OkoWalletMsgOpenModal,
  ) => Promise<Result<OpenModalAckPayload, OpenModalError>>;
  closeModal: () => void;
  sendMsgToIframe: (msg: OkoWalletMsg) => Promise<OkoWalletMsg>;
  signIn: (type: "google" | "email" | "x" | "telegram") => Promise<void>;
  signOut: () => Promise<void>;
  getPublicKey: () => Promise<string | null>;
  getEmail: () => Promise<string | null>;
  startEmailSignIn: (email: string) => Promise<void>;
  completeEmailSignIn: (email: string, code: string) => Promise<void>;
  on: (handlerDef: OkoWalletCoreEventHandler2) => void;
}

export interface OkoWalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface OkoWalletState {
  email: string | null;
  publicKey: string | null;
}
