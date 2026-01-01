use frost_ed25519_keplr::reshare;
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use crate::{KeyPackageRaw, PublicKeyPackageRaw};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReshareOutputRaw {
    pub key_packages: Vec<KeyPackageRaw>,
    pub public_key_package: PublicKeyPackageRaw,
    pub secret: [u8; 32],
}

/// Reshares existing key packages to a new set of nodes with a fresh polynomial.
///
/// Takes existing KeyPackageRaw objects, recovers the secret, and creates new
/// KeyPackages for the new identifiers.
#[wasm_bindgen]
pub fn sss_reshare(
    key_packages: JsValue,
    new_identifiers: JsValue,
    new_min_signers: u16,
) -> Result<JsValue, JsValue> {
    let key_packages_raw: Vec<KeyPackageRaw> = key_packages
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid key_packages format: {}", err)))?;

    let new_identifiers: Vec<[u8; 32]> = new_identifiers
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid new_identifiers format: {}", err)))?;

    let key_packages: Vec<_> = key_packages_raw
        .iter()
        .map(|kp| kp.to_key_package())
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let mut rng = OsRng;
    let reshare_output = reshare(&key_packages, new_identifiers, new_min_signers, &mut rng)
        .map_err(|err| JsValue::from_str(&err))?;

    let key_packages_raw: Vec<KeyPackageRaw> = reshare_output
        .key_packages
        .iter()
        .map(|kp| KeyPackageRaw::from_key_package(kp))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let public_key_package =
        PublicKeyPackageRaw::from_public_key_package(&reshare_output.public_key_package)
            .map_err(|err| JsValue::from_str(&err))?;

    let result = ReshareOutputRaw {
        key_packages: key_packages_raw,
        public_key_package,
        secret: reshare_output.secret,
    };

    JsValue::from_serde(&result).map_err(|err| JsValue::from_str(&err.to_string()))
}
