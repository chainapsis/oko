use cait_sith_keplr::tecdsa_cli_srv::cli_triples::TriplesClient;
use cait_sith_keplr::tecdsa_cli_srv::srv_triples::TriplesServer;
use cait_sith_keplr::triples::{RcvdTriplesMessages, TriplesState};
use gloo_utils::format::JsValueSerdeExt;
use k256::Secp256k1;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn srv_triples_step_1() -> Result<JsValue, JsValue> {
    let out = TriplesServer::triples_step_1();

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_1() -> Result<JsValue, JsValue> {
    let out = TriplesClient::triples_step_1()
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_2(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_2(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_3(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_3(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_4(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_4(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_5(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_5(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_6(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_6(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_7(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_7(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_8(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_8(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_9(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_9(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_10(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_10(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_triples_2_step_11(
    st_0: JsValue,   // TriplesState<Secp256k1>,
    msgs_0: JsValue, // RcvdTriplesMessages<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: TriplesState<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = TriplesClient::triples_step_11(st_0, msgs_0)
        .map_err(|e| JsValue::from_str(&format!("triples error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
