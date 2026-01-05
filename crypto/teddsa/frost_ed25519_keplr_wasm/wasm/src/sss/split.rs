use frost_ed25519_keplr::sss_split_ed25519;
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use crate::{KeyPackageRaw, PublicKeyPackageRaw};

/// Output of the split operation for WASM.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SplitOutputRaw {
    /// Key packages for each participant
    pub key_packages: Vec<KeyPackageRaw>,
    /// The public key package shared among all participants
    pub public_key_package: PublicKeyPackageRaw,
}

/// Splits an Ed25519 secret into FROST key packages using VSS.
///
/// Returns KeyPackages that can be used directly for FROST signing,
/// along with a PublicKeyPackage.
#[wasm_bindgen]
pub fn sss_split(
    secret: JsValue,
    identifiers: JsValue,
    min_signers: u16,
) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid secret format: {}", err)))?;
    let identifiers: Vec<[u8; 32]> = identifiers
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid identifiers format: {}", err)))?;

    let mut rng = OsRng;
    let output = sss_split_ed25519(secret, identifiers, min_signers, &mut rng)
        .map_err(|err| JsValue::from_str(&err))?;

    let key_packages: Vec<KeyPackageRaw> = output
        .key_packages
        .iter()
        .map(|kp| KeyPackageRaw::from_key_package(kp))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| JsValue::from_str(&err))?;

    let public_key_package = PublicKeyPackageRaw::from_public_key_package(&output.public_key_package)
        .map_err(|err| JsValue::from_str(&err))?;

    let result = SplitOutputRaw {
        key_packages,
        public_key_package,
    };

    JsValue::from_serde(&result).map_err(|err| JsValue::from_str(&err.to_string()))
}
