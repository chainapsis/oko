use teddsa_keplr::{keygen_centralized, keygen_import};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

/// Generate a 2-of-2 threshold Ed25519 key using centralized key generation.
///
/// Returns a JSON object containing:
/// - `keygen_outputs`: Array of two key shares
/// - `public_key`: The Ed25519 public key (32 bytes)
/// - `private_key`: Placeholder (not used in threshold scheme)
#[wasm_bindgen]
pub fn cli_keygen_centralized_ed25519() -> Result<JsValue, JsValue> {
    let out = keygen_centralized().map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

/// Import an existing Ed25519 secret key and split it into threshold shares.
///
/// # Arguments
/// * `secret_key` - A 32-byte array representing the Ed25519 secret key
///
/// Returns a JSON object containing the threshold shares.
#[wasm_bindgen]
pub fn cli_keygen_import_ed25519(secret_key: JsValue) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret_key
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid secret key format: {}", err)))?;

    let out = keygen_import(secret).map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
