use frost_ed25519_keplr::sss_combine_ed25519;
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

use crate::KeyPackageRaw;

/// Combines Ed25519 key packages to recover the original secret.
///
/// Takes an array of KeyPackageRaw objects and uses FROST's reconstruct
/// to recover the original signing key via Lagrange interpolation.
///
/// NOTE: The caller must provide at least `min_signers` key packages.
#[wasm_bindgen]
pub fn sss_combine(key_packages: JsValue) -> Result<JsValue, JsValue> {
    let key_packages_raw: Vec<KeyPackageRaw> = key_packages
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid key_packages format: {}", err)))?;

    let key_packages: Vec<_> = key_packages_raw
        .iter()
        .map(|kp| kp.to_key_package())
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let secret = sss_combine_ed25519(&key_packages)
        .map_err(|err| JsValue::from_str(&err))?;

    JsValue::from_serde(&secret).map_err(|err| JsValue::from_str(&err.to_string()))
}
