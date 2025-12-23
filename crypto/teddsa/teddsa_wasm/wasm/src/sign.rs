use teddsa_core::{aggregate, sign_round1, sign_round2, verify};
use gloo_utils::format::JsValueSerdeExt;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct SignRound2Input {
    pub message: Vec<u8>,
    pub key_package: Vec<u8>,
    pub nonces: Vec<u8>,
    pub all_commitments: Vec<CommitmentEntry>,
}

#[derive(Serialize, Deserialize)]
pub struct CommitmentEntry {
    pub identifier: Vec<u8>,
    pub commitments: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct AggregateInput {
    pub message: Vec<u8>,
    pub all_commitments: Vec<CommitmentEntry>,
    pub all_signature_shares: Vec<SignatureShareEntry>,
    pub public_key_package: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct SignatureShareEntry {
    pub identifier: Vec<u8>,
    pub signature_share: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct VerifyInput {
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
    pub public_key_package: Vec<u8>,
}

#[wasm_bindgen]
pub fn cli_sign_round1_ed25519(key_package: JsValue) -> Result<JsValue, JsValue> {
    let key_package_bytes: Vec<u8> = key_package
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid key_package format: {}", err)))?;

    let out = sign_round1(&key_package_bytes).map_err(|err| JsValue::from_str(&err.to_string()))?;
    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_sign_round2_ed25519(input: JsValue) -> Result<JsValue, JsValue> {
    let input: SignRound2Input = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    let all_commitments: Vec<(Vec<u8>, Vec<u8>)> = input
        .all_commitments
        .into_iter()
        .map(|c| (c.identifier, c.commitments))
        .collect();

    let out = sign_round2(&input.message, &input.key_package, &input.nonces, &all_commitments)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_aggregate_ed25519(input: JsValue) -> Result<JsValue, JsValue> {
    let input: AggregateInput = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    let all_commitments: Vec<(Vec<u8>, Vec<u8>)> = input
        .all_commitments
        .into_iter()
        .map(|c| (c.identifier, c.commitments))
        .collect();

    let all_signature_shares: Vec<(Vec<u8>, Vec<u8>)> = input
        .all_signature_shares
        .into_iter()
        .map(|s| (s.identifier, s.signature_share))
        .collect();

    let out = aggregate(
        &input.message,
        &all_commitments,
        &all_signature_shares,
        &input.public_key_package,
    )
    .map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_verify_ed25519(input: JsValue) -> Result<bool, JsValue> {
    let input: VerifyInput = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    verify(&input.message, &input.signature, &input.public_key_package)
        .map_err(|err| JsValue::from_str(&err.to_string()))
}
