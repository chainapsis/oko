import type {
  MakeCosmosSigData,
  MakeCosmosSigError,
  MakeCosmosSigModalResult,
} from "./cosmos";
import type {
  MakeEthereumSigData,
  MakeEthSigError,
  MakeEthSigModalResult,
} from "./eth";
import type {
  MakeSolanaSigData,
  MakeSolSigError,
  MakeSolSigModalResult,
} from "./sol";

export * from "./common";
export * from "./cosmos";
export * from "./eth";
export * from "./sol";

export type MakeSigModalPayload =
  | {
      modal_type: "cosmos/make_signature";
      modal_id: string;
      data: MakeCosmosSigData;
    }
  | {
      modal_type: "eth/make_signature";
      modal_id: string;
      data: MakeEthereumSigData;
    }
  | {
      modal_type: "sol/make_signature";
      modal_id: string;
      data: MakeSolanaSigData;
    };

export type MakeSigModalApproveAckPayload =
  | {
      modal_type: "cosmos/make_signature";
      modal_id: string;
      type: "approve";
      data: MakeCosmosSigModalResult;
    }
  | {
      modal_type: "eth/make_signature";
      modal_id: string;
      type: "approve";
      data: MakeEthSigModalResult;
    }
  | {
      modal_type: "sol/make_signature";
      modal_id: string;
      type: "approve";
      data: MakeSolSigModalResult;
    };

export type MakeSigModalRejectAckPayload =
  | {
      modal_type: "eth/make_signature";
      modal_id: string;
      type: "reject";
    }
  | {
      modal_type: "cosmos/make_signature";
      modal_id: string;
      type: "reject";
    }
  | {
      modal_type: "sol/make_signature";
      modal_id: string;
      type: "reject";
    };

export type MakeSigModalErrorAckPayload =
  | {
      modal_type: "eth/make_signature";
      modal_id: string;
      type: "error";
      error: MakeEthSigError;
    }
  | {
      modal_type: "cosmos/make_signature";
      modal_id: string;
      type: "error";
      error: MakeCosmosSigError;
    }
  | {
      modal_type: "sol/make_signature";
      modal_id: string;
      type: "error";
      error: MakeSolSigError;
    };
