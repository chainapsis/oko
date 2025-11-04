use cait_sith_keplr::presign::{PresignState2, RcvdPresignMessages2};
use cait_sith_keplr::tecdsa_cli_srv::cli_presign::PresignClient;
use cait_sith_keplr::tecdsa_cli_srv::srv_presign::PresignServer;
use cait_sith_keplr::triples::{TriplePub, TripleShare};
use cait_sith_keplr::KeygenOutput;
use gloo_utils::format::JsValueSerdeExt;
use k256::Secp256k1;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn cli_presign_step_1(
    pub_0: JsValue,     // TriplePub<Secp256k1>,
    pub_1: JsValue,     // TriplePub<Secp256k1>,
    share_0_0: JsValue, // TripleShare<Secp256k1>,
    share_1_0: JsValue, // TripleShare<Secp256k1>,
    keygen_0: JsValue,  // KeygenOutput<Secp256k1>
) -> Result<JsValue, JsValue> {
    let pub_0: TriplePub<Secp256k1> = pub_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (pub_0): {:?}", e)))?;

    let pub_1: TriplePub<Secp256k1> = pub_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (pub_1): {:?}", e)))?;

    let share_0_0: TripleShare<Secp256k1> = share_0_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (share_0_0): {:?}", e)))?;

    let share_1_0: TripleShare<Secp256k1> = share_1_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (share_1_0): {:?}", e)))?;

    let keygen_0: KeygenOutput<Secp256k1> = keygen_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (keygen_0): {:?}", e)))?;

    let out = PresignClient::presign_step_1(pub_0, pub_1, share_0_0, share_1_0, keygen_0)
        .map_err(|e| JsValue::from_str(&format!("presign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_presign_step_2(st_0: JsValue, // PresignState2<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: PresignState2<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let out = PresignClient::presign_step_2(st_0)
        .map_err(|e| JsValue::from_str(&format!("presign error (step 2): {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_presign_step_3(
    st_0: JsValue,   // PresignState2<Secp256k1>,
    msgs_0: JsValue, // RcvdPresignMessages2<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_0: PresignState2<Secp256k1> = st_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_0): {:?}", e)))?;

    let msgs_0: RcvdPresignMessages2<Secp256k1> = msgs_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_0): {:?}", e)))?;

    let out = PresignClient::presign_step_3(st_0, &msgs_0)
        .map_err(|e| JsValue::from_str(&format!("presign error (step 3): {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn srv_presign_step_1(
    pub_0: JsValue,     // TriplePub<Secp256k1>,
    pub_1: JsValue,     // TriplePub<Secp256k1>,
    share_0_1: JsValue, // TripleShare<Secp256k1>,
    share_1_1: JsValue, // TripleShare<Secp256k1>,
    keygen_1: JsValue,  // KeygenOutput<Secp256k1>
) -> Result<JsValue, JsValue> {
    let pub_0: TriplePub<Secp256k1> = pub_0
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (pub_0): {:?}", e)))?;

    let pub_1: TriplePub<Secp256k1> = pub_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (pub_1): {:?}", e)))?;

    let share_0_1: TripleShare<Secp256k1> = share_0_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (share_0_0): {:?}", e)))?;

    let share_1_1: TripleShare<Secp256k1> = share_1_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (share_1_0): {:?}", e)))?;

    let keygen_1: KeygenOutput<Secp256k1> = keygen_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (keygen_1): {:?}", e)))?;

    let out = PresignServer::presign_step_1(pub_0, pub_1, share_0_1, share_1_1, keygen_1)
        .map_err(|e| JsValue::from_str(&format!("presign error: {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn srv_presign_step_2(st_1: JsValue, // PresignState2<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_1: PresignState2<Secp256k1> = st_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_1): {:?}", e)))?;

    let out = PresignServer::presign_step_2(st_1)
        .map_err(|e| JsValue::from_str(&format!("presign error (server step_2): {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn srv_presign_step_3(
    st_1: JsValue,   // PresignState2<Secp256k1>,
    msgs_1: JsValue, // RcvdPresignMessages2<Secp256k1>
) -> Result<JsValue, JsValue> {
    let st_1: PresignState2<Secp256k1> = st_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (st_1): {:?}", e)))?;

    let msgs_1: RcvdPresignMessages2<Secp256k1> = msgs_1
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (msgs_1): {:?}", e)))?;

    let out = PresignServer::presign_step_3(st_1, &msgs_1)
        .map_err(|e| JsValue::from_str(&format!("presign error (server step_3): {:?}", e)))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
