use teddsa_keplr::{aggregate, sign_round1, sign_round2, verify};
use gloo_utils::format::JsValueSerdeExt;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Input for sign round 2
#[derive(Serialize, Deserialize)]
pub struct SignRound2Input {
    pub message: Vec<u8>,
    pub key_package: Vec<u8>,
    pub nonces: Vec<u8>,
    pub all_commitments: Vec<CommitmentEntry>,
}

/// A commitment entry (identifier + commitments)
#[derive(Serialize, Deserialize)]
pub struct CommitmentEntry {
    pub identifier: Vec<u8>,
    pub commitments: Vec<u8>,
}

/// Input for signature aggregation
#[derive(Serialize, Deserialize)]
pub struct AggregateInput {
    pub message: Vec<u8>,
    pub all_commitments: Vec<CommitmentEntry>,
    pub all_signature_shares: Vec<SignatureShareEntry>,
    pub public_key_package: Vec<u8>,
}

/// A signature share entry (identifier + signature_share)
#[derive(Serialize, Deserialize)]
pub struct SignatureShareEntry {
    pub identifier: Vec<u8>,
    pub signature_share: Vec<u8>,
}

/// Input for signature verification
#[derive(Serialize, Deserialize)]
pub struct VerifyInput {
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
    pub public_key_package: Vec<u8>,
}

/// Round 1: Generate signing commitments for a participant.
///
/// # Arguments
/// * `key_package` - The participant's serialized KeyPackage
///
/// Returns a JSON object containing:
/// - `nonces`: Serialized nonces (keep secret, use in round 2)
/// - `commitments`: Serialized commitments (send to coordinator)
/// - `identifier`: Participant identifier
#[wasm_bindgen]
pub fn cli_sign_round1_ed25519(key_package: JsValue) -> Result<JsValue, JsValue> {
    let key_package_bytes: Vec<u8> = key_package
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid key_package format: {}", err)))?;

    let out = sign_round1(&key_package_bytes).map_err(|err| JsValue::from_str(&err.to_string()))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

/// Round 2: Generate a signature share for a participant.
///
/// # Arguments
/// * `input` - JSON object containing message, key_package, nonces, and all_commitments
///
/// Returns a JSON object containing:
/// - `signature_share`: The participant's signature share
/// - `identifier`: Participant identifier
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

/// Aggregate signature shares into a final threshold signature.
///
/// # Arguments
/// * `input` - JSON object containing message, all_commitments, all_signature_shares, and public_key_package
///
/// Returns a JSON object containing:
/// - `signature`: The 64-byte Ed25519 signature
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

/// Verify a signature against a public key.
///
/// # Arguments
/// * `input` - JSON object containing message, signature, and public_key_package
///
/// Returns `true` if the signature is valid, `false` otherwise.
#[wasm_bindgen]
pub fn cli_verify_ed25519(input: JsValue) -> Result<bool, JsValue> {
    let input: VerifyInput = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    verify(&input.message, &input.signature, &input.public_key_package)
        .map_err(|err| JsValue::from_str(&err.to_string()))
}
