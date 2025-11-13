import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const paths = (function() {
  const root = path.join(__dirname, "../../../");

  const ksn_interface = path.join(
    __dirname,
    "../../../key_share_node/ksn_interface/",
  );

  const ksn_server = path.join(__dirname, "../../../key_share_node/server");

  const ksn_pg_interface = path.join(
    __dirname,
    "../../../key_share_node/pg_interface/",
  );

  const dotenv = path.join(__dirname, "../../../lib/dotenv");

  const stdlib = path.join(__dirname, "../../../lib/stdlib_js");

  const sdk_common = path.join(__dirname, "../../../sdk/oko_sdk_common/");

  const sdk_core = path.join(__dirname, "../../../sdk/oko_sdk_core/");

  const sdk_eth = path.join(__dirname, "../../../sdk/oko_sdk_eth/");

  const sdk_cosmos = path.join(__dirname, "../../../sdk/oko_sdk_cosmos/");

  const sandbox_simple_host = path.join(
    __dirname,
    "../../../sandbox/sandbox_simple_host/",
  );

  const crypto_bytes = path.join(__dirname, "../../../crypto/bytes/");

  const tecdsa_interface = path.join(
    __dirname,
    "../../../crypto/tecdsa/tecdsa_interface/",
  );

  // internals2
  const cait_sith_addon_addon = path.join(
    __dirname,
    "../../../crypto/tecdsa/cait_sith_keplr_addon/addon",
  );

  const cait_sith_keplr_wasm = path.join(
    __dirname,
    "../../../crypto/tecdsa/cait_sith_keplr_wasm",
  );

  const oko_pg_interface = path.join(
    __dirname,
    "../../../backend/oko_pg_interface",
  );

  const oko_attached = path.join(__dirname, "../../../embed/oko_attached");

  const oko_admin_web = path.join(__dirname, "../../../apps/oko_admin_web/");

  const demo_web = path.join(__dirname, "../../../apps/demo_web");

  const ct_dashboard_web = path.join(
    __dirname,
    "../../../apps/customer_dashboard",
  );

  const oko_api_server = path.join(
    __dirname,
    "../../../backend/oko_api/server",
  );

  const tss_api = path.join(__dirname, "../../../backend/tss_api");

  const admin_api = path.join(__dirname, "../../../backend/admin_api");

  const ct_dashboard_api = path.join(
    __dirname,
    "../../../backend/ct_dashboard_api",
  );

  const dockerfiles = path.join(__dirname, "../../docker");

  const dockerfiles_oko = path.join(__dirname, "../../docker/oko");

  return {
    root,
    stdlib,
    dotenv,
    sdk_core,
    sdk_eth,
    sdk_cosmos,
    sdk_common,
    crypto_bytes,
    ksn_interface,
    ksn_server,
    ksn_pg_interface,
    sandbox_simple_host,
    tecdsa_interface,
    oko_pg_interface,
    oko_attached,
    oko_admin_web,
    cait_sith_keplr_wasm,
    cait_sith_addon_addon,
    demo_web,
    ct_dashboard_web,
    oko_api_server,
    tss_api,
    admin_api,
    ct_dashboard_api,
    dockerfiles,
    dockerfiles_oko,
  };
})();
