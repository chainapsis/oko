use frost_ed25519_keplr::{sss_combine_ed25519, Point256};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sss_combine(points: JsValue, t: u32) -> Result<JsValue, JsValue> {
    let points_serde: Vec<PointSerde> = points
        .into_serde()
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    // Convert to Point256
    let points: Vec<Point256> = points_serde
        .into_iter()
        .map(|p| Point256 { x: p.x, y: p.y })
        .collect();

    let out =
        sss_combine_ed25519(points, t).map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[derive(serde::Serialize, serde::Deserialize)]
struct PointSerde {
    x: [u8; 32],
    y: [u8; 32],
}
