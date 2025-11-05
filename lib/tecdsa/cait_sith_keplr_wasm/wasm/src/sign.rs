use cait_sith_keplr::compat::scalar_hash;
use cait_sith_keplr::sign::{RcvdSignMessages, SignState2};
use cait_sith_keplr::tecdsa_cli_srv::cli_sign::SignClient;
use cait_sith_keplr::tecdsa_cli_srv::srv_sign::SignServer;
use cait_sith_keplr::PresignOutput;
use cait_sith_keplr::Secp256k1;
use gloo_utils::format::JsValueSerdeExt;
use k256::elliptic_curve::scalar::FromUintUnchecked;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn cli_sign_step_1(
    msg: String,
    presig_0: JsValue, // PresignOutput<Secp256k1>
) -> Result<JsValue, JsValue> {
    let msg_hash = scalar_hash(msg.as_bytes());

    let presig_0: PresignOutput<Secp256k1> = presig_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (presig_0): {:?}", e)))?;

    let out = SignClient::sign_step_1(msg_hash.into(), presig_0)
        .map_err(|e| JsValue::from_str(&format!("sign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_sign_step_1_2(
    msg: &[u8],
    presig_0: JsValue, // PresignOutput<Secp256k1>
) -> Result<JsValue, JsValue> {
    let msg_hash = k256::Scalar::from_uint_unchecked(k256::U256::from_be_slice(msg));

    let presig_0: PresignOutput<Secp256k1> = presig_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (presig_0): {:?}", e)))?;

    let out = SignClient::sign_step_1(msg_hash.into(), presig_0)
        .map_err(|e| JsValue::from_str(&format!("sign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_sign_step_2(
    st_0: JsValue,     // SignState2<Secp256k1>,
    msgs_0: JsValue,   // RcvdSignMessages<Secp256k1>,
    presig_0: JsValue, // PresignOutput<Secp256k1>,
) -> Result<JsValue, JsValue> {
    let mut st_0: SignState2<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdSignMessages<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let presig_0: PresignOutput<Secp256k1> = presig_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (presig_0): {:?}", e)))?;

    let out = SignClient::sign_step_2(&mut st_0, &msgs_0, presig_0)
        .map_err(|e| JsValue::from_str(&format!("sign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn srv_sign_step_1(
    msg: String,
    presig_1: JsValue, // PresignOutput<Secp256k1>
) -> Result<JsValue, JsValue> {
    let msg_hash = scalar_hash(msg.as_bytes());

    let presig_1: PresignOutput<Secp256k1> = presig_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (presig_1): {:?}", e)))?;

    let out = SignServer::sign_step_1(msg_hash.into(), presig_1)
        .map_err(|e| JsValue::from_str(&format!("sign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn srv_sign_step_2(
    st_1: JsValue,     // SignState2<Secp256k1>,
    msgs_1: JsValue,   // RcvdSignMessages<Secp256k1>,
    presig_1: JsValue, // PresignOutput<Secp256k1>,
) -> Result<JsValue, JsValue> {
    let mut st_1: SignState2<Secp256k1> = st_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_1): {:?}", e)))?;

    let msgs_1: RcvdSignMessages<Secp256k1> = msgs_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_1): {:?}", e)))?;

    let presig_1: PresignOutput<Secp256k1> = presig_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (presig_1): {:?}", e)))?;

    let out = SignServer::sign_step_2(&mut st_1, &msgs_1, presig_1)
        .map_err(|e| JsValue::from_str(&format!("sign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
