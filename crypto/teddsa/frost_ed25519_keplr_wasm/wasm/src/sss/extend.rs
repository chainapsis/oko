use frost_ed25519_keplr::extend_shares_ed25519;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use crate::{KeyPackageRaw, PublicKeyPackageRaw};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtendOutputRaw {
    /// New key packages for the additional participants
    pub new_key_packages: Vec<KeyPackageRaw>,
    /// The updated public key package (includes new verifying shares)
    pub public_key_package: PublicKeyPackageRaw,
}

/// Extends existing key packages to include new participants without changing the polynomial.
///
/// Unlike reshare, this preserves the original polynomial and existing shares remain valid.
/// New shares are computed via Lagrange interpolation on the existing shares.
///
/// # Arguments
/// * `key_packages` - Existing key packages (at least min_signers required)
/// * `new_identifiers` - Identifiers for the new participants to add
/// * `public_key_package` - The existing public key package
///
/// # Returns
/// New KeyPackages for the additional identifiers. Existing shares remain valid.
#[wasm_bindgen]
pub fn sss_extend_shares(
    key_packages: JsValue,
    new_identifiers: JsValue,
    public_key_package: JsValue,
) -> Result<JsValue, JsValue> {
    let key_packages_raw: Vec<KeyPackageRaw> = serde_wasm_bindgen::from_value(key_packages)
        .map_err(|err| JsValue::from_str(&format!("Invalid key_packages format: {}", err)))?;

    let new_identifiers: Vec<[u8; 32]> = serde_wasm_bindgen::from_value(new_identifiers)
        .map_err(|err| JsValue::from_str(&format!("Invalid new_identifiers format: {}", err)))?;

    let public_key_package_raw: PublicKeyPackageRaw =
        serde_wasm_bindgen::from_value(public_key_package)
            .map_err(|err| JsValue::from_str(&format!("Invalid public_key_package format: {}", err)))?;

    let key_packages: Vec<_> = key_packages_raw
        .iter()
        .map(|kp| kp.to_key_package())
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let public_key_package = public_key_package_raw
        .to_public_key_package()
        .map_err(|err| JsValue::from_str(&err))?;

    let extend_output = extend_shares_ed25519(&key_packages, new_identifiers, &public_key_package)
        .map_err(|err| JsValue::from_str(&err))?;

    let new_key_packages_raw: Vec<KeyPackageRaw> = extend_output
        .new_key_packages
        .iter()
        .map(|kp| KeyPackageRaw::from_key_package(kp))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let updated_public_key_package =
        PublicKeyPackageRaw::from_public_key_package(&extend_output.public_key_package)
            .map_err(|err| JsValue::from_str(&err))?;

    let result = ExtendOutputRaw {
        new_key_packages: new_key_packages_raw,
        public_key_package: updated_public_key_package,
    };

    serde_wasm_bindgen::to_value(&result).map_err(|err| JsValue::from_str(&err.to_string()))
}
