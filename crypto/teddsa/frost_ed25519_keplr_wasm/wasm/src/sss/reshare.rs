use frost_ed25519_keplr::{expand_shares, reshare, Point256, ReshareResult};
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sss_reshare(points: JsValue, ks_node_hashes: JsValue, t: u32) -> Result<JsValue, JsValue> {
    let points: Vec<Point256> = points
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;
    let ks_node_hashes: Vec<[u8; 32]> = ks_node_hashes
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let mut rng = OsRng;
    let out: ReshareResult = reshare(points, ks_node_hashes, t, &mut rng)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn sss_expand_shares(
    points: JsValue,
    additional_ks_node_hashes: JsValue,
    t: u32,
) -> Result<JsValue, JsValue> {
    let points: Vec<Point256> = points
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;
    let additional_ks_node_hashes: Vec<[u8; 32]> = additional_ks_node_hashes
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let out: ReshareResult = expand_shares(points, additional_ks_node_hashes, t)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
