import type { Express, Response } from "express";
import type { ServerStatus } from "@oko-wallet/ksn-interface/status";
import {
  getLatestCompletedPgDump,
  getTelemetryId,
} from "@oko-wallet/ksn-pg-interface";
import dayjs from "dayjs";

import { logger } from "@oko-wallet-ksn-server/logger";

export function addStatusRoutes(app: Express) {
  app.get("/status", async (req, res: Response<ServerStatus>) => {
    const state = req.app.locals;
    const { db } = state;

    let isDbConnected = false;
    try {
      await db.query("SELECT 1");
      isDbConnected = true;
    } catch (err) {
      logger.error("Database connection check failed, err: %s", err);
    }

    let latestBackupTime: string | null = null;
    try {
      const getLatestDumpRes = await getLatestCompletedPgDump(db);
      if (getLatestDumpRes.success) {
        if (getLatestDumpRes.data?.created_at) {
          latestBackupTime = dayjs(
            getLatestDumpRes.data?.created_at,
          ).toISOString();
        }
      } else {
        logger.error("Failed to get latest dump:", getLatestDumpRes.err);
      }
    } catch (err: any) {
      logger.error("Get latest pg dump, err: %s", err);
    }

    let telemetryNodeId: string | null = null;
    try {
      const getTelemetryIdRes = await getTelemetryId(db);
      if (getTelemetryIdRes.success) {
        telemetryNodeId = getTelemetryIdRes.data;
      } else {
        logger.error("Failed to get telemetry id: %s", getTelemetryIdRes.err);
      }
    } catch (err) {
      logger.error("Get telemetry id error: %s", err);
    }

    const status: ServerStatus = {
      is_db_connected: isDbConnected,
      is_db_backup_checked: state.is_db_backup_checked,
      latest_backup_time: latestBackupTime,
      ks_node_public_key: state.serverKeypair.publicKey.toHex(),
      launch_time: state.launch_time,
      git_hash: state.git_hash,
      version: state.version,
      telemetry_node_id: telemetryNodeId,
    };

    res.status(200).json(status);
  });
}
