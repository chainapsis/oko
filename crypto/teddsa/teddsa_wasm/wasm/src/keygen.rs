use teddsa_core::{keygen_centralized, keygen_import};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn cli_keygen_centralized_ed25519() -> Result<JsValue, JsValue> {
    let out = keygen_centralized().map_err(|err| JsValue::from_str(&err.to_string()))?;
    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_keygen_import_ed25519(secret_key: JsValue) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret_key
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid secret key format: {}", err)))?;

    let out = keygen_import(secret).map_err(|err| JsValue::from_str(&err.to_string()))?;
    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
