export interface ServerStatus {
  is_db_connected: boolean;
  is_db_backup_checked: boolean;
  latest_backup_time: string | null;
  ks_node_public_key: string;
  launch_time: string;
  git_hash: string | null;
  version: string;
  telemetry_node_id: string | null;
}
