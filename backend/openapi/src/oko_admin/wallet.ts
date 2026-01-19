import { z } from "zod";

import { registry } from "../registry";
import { PaginationSchema } from "../common/";

const WalletWithEmailAndKSNodesResponseSchema = registry.register(
  "WalletWithEmailAndKSNodesResponse",
  z.object({
    public_key: z.string().openapi({
      description: "Wallet public key in hex format",
    }),

    email: z.email().openapi({
      description: "User email address",
    }),

    wallet_id: z.string().openapi({
      description: "Wallet identifier",
    }),

    wallet_ks_nodes: z
      .array(
        z.string().openapi({
          description: "KS node identifier",
        }),
      )
      .openapi({
        description: "Wallet KS nodes",
      }),
  }),
);

export const GetWalletListRequestSchema = registry.register(
  "GetWalletListRequest",
  z.object({
    limit: z.number().int().optional().openapi({
      description: "Number of wallets to return (default: 10)",
      example: 10,
    }),
    offset: z.number().int().optional().openapi({
      description: "Offset for pagination (default: 0)",
      example: 0,
    }),
  }),
);

const WalletListDataSchema = registry.register(
  "WalletListData",
  z.object({
    wallets: z
      .array(
        WalletWithEmailAndKSNodesResponseSchema.openapi({
          description: "Wallet with user email and KS nodes",
        }),
      )
      .openapi({
        description: "List of wallets",
      }),

    pagination: PaginationSchema.openapi({
      description: "Pagination info",
    }),
  }),
);

// export const GetWalletListSuccessResponseSchema = makeSuccessResponseSchema(
//   WalletListDataSchema,
//   "GetWalletListSuccessResponse",
// );
export const GetWalletListSuccessResponseSchema = registry.register(
  "GetWalletListSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: WalletListDataSchema,
  }),
);
