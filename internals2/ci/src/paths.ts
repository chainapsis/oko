import path from "node:path";

export const paths = (function () {
  const cait_sith_addon_addon = path.join(
    __dirname,
    "../../../lib/tecdsa/cait_sith_keplr_addon/addon",
  );

  const cait_sith_keplr_wasm = path.join(
    __dirname,
    "../../../lib/tecdsa/cait_sith_keplr_wasm",
  );

  const ewallet_pg_interface = path.join(
    __dirname,
    "../../../backend/ewallet_pg_interface",
  );

  const ewallet_attached = path.join(
    __dirname,
    "../../../embed/ewallet_attached",
  );

  const ewallet_admin_web = path.join(
    __dirname,
    "../../../apps/ewallet_admin_web/",
  );

  const demo_web = path.join(__dirname, "../../../apps/demo_web");

  const ct_dashboard_web = path.join(
    __dirname,
    "../../../apps/customer_dashboard",
  );

  const ewallet_api_server = path.join(
    __dirname,
    "../../../backend/ewallet_api/server",
  );

  const tss_api = path.join(__dirname, "../../../backend/tss_api");

  const admin_api = path.join(__dirname, "../../../backend/admin_api");

  const ct_dashboard_api = path.join(
    __dirname,
    "../../../backend/ct_dashboard_api",
  );

  const dockerfiles = path.join(__dirname, "../../docker/dockerfiles");

  return {
    ewallet_pg_interface,
    cait_sith_addon_addon,
    ewallet_attached,
    ewallet_admin_web,
    cait_sith_keplr_wasm,
    demo_web,
    ct_dashboard_web,
    ewallet_api_server,
    tss_api,
    admin_api,
    ct_dashboard_api,
    dockerfiles,
  };
})();
