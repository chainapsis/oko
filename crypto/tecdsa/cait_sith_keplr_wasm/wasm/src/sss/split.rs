use cait_sith_keplr::sss::split;
use gloo_utils::format::JsValueSerdeExt;
use k256::Secp256k1;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sss_split(secret: JsValue, ks_node_hashes: JsValue, t: u32) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;
    let ks_node_hashes: Vec<[u8; 32]> = ks_node_hashes
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let out = split::<Secp256k1>(secret, ks_node_hashes, t)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
