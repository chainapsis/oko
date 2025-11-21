/**
 * Public API Endpoint: Get ECDSA Public Key
 * Returns the currently active ECDSA public key
 * Used by KS Nodes to verify rollback signatures
 */

import type { Request, Response, Router } from "express";
import { getActiveECDSAKeypair } from "@oko-wallet/oko-pg-interface/ecdsa_keypairs";

export interface ECDSAPublicKeyResponse {
  success: boolean;
  data?: {
    publicKey: string;
    createdAt: string;
    keyId: number;
  };
  error?: string;
}

/**
 * Set ECDSA public key routes
 */
export function setEcdsaPublicKeyRoutes(router: Router) {
  /**
   * GET /ecdsa-public-key
   * Returns the active ECDSA public key
   */
  router.get(
    "/public-key",
    async (req: Request, res: Response<ECDSAPublicKeyResponse>) => {
      const state = req.app.locals;

      try {
        // Get active keypair
        const result = await getActiveECDSAKeypair(state.db);

        if (!result.success) {
          res.status(500).json({
            success: false,
            error: `Failed to retrieve active ECDSA keypair: ${result.err}`,
          });
          return;
        }

        if (!result.data) {
          res.status(404).json({
            success: false,
            error: "No active ECDSA keypair found",
          });
          return;
        }

        const keypair = result.data;

        // Return only public information
        res.status(200).json({
          success: true,
          data: {
            publicKey: keypair.public_key,
            createdAt: keypair.created_at.toISOString(),
            keyId: keypair.id,
          },
        });
      } catch (error) {
        console.error("Error in getECDSAPublicKeyHandler:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    },
  );
}
