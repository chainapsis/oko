use frost_ed25519_keplr::{sss_split_ed25519, Point256};
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sss_split(secret: JsValue, point_xs: JsValue, t: u32) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;
    let point_xs: Vec<[u8; 32]> = point_xs
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let mut rng = OsRng;
    let out: Vec<Point256> = sss_split_ed25519(secret, point_xs, t, &mut rng)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
