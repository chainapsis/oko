import { Pool } from "pg";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetWalletListRequest,
  GetWalletListResponse,
} from "@oko-wallet/oko-types/admin";
import {
  getAllWallets,
  getWalletsCount,
} from "@oko-wallet/oko-pg-interface/oko_wallets";

export async function getWalletList(
  db: Pool,
  body: GetWalletListRequest,
): Promise<OkoApiResponse<GetWalletListResponse>> {
  try {
    let { limit, offset } = body;
    if (!limit || !offset) {
      limit = 10;
      offset = 0;
    } else {
      limit = Number(limit);
      offset = Number(offset);
    }

    const getAllWalletsRes = await getAllWallets(db, limit, offset);
    if (getAllWalletsRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get all wallets: ${getAllWalletsRes.err}`,
      };
    }

    const getWalletsCountRes = await getWalletsCount(db);
    if (getWalletsCountRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get wallets count: ${getWalletsCountRes.err}`,
      };
    }

    const total = getWalletsCountRes.data;
    const totalPages = Math.ceil(total / limit);
    const currentPage = total ? Math.floor(offset / limit) + 1 : 0;

    return {
      success: true,
      data: {
        wallets: getAllWalletsRes.data.map((wallet) => ({
          public_key: wallet.public_key.toString("hex"),
          email: wallet.email,
          wallet_id: wallet.wallet_id,
          wallet_ks_nodes: wallet.wallet_ks_nodes,
        })),
        pagination: {
          total,
          current_page: currentPage,
          total_pages: totalPages,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get wallet list: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
