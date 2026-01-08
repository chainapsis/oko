use frost::round1::{SigningCommitments, SigningNonces};
use frost::round2::SignatureShare;
use frost::{Identifier, SigningPackage};
use frost_ed25519_keplr as frost;
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

use crate::{KeyPackageRaw, PublicKeyPackageRaw};

/// Output from a signing round 1 (commitment)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SigningCommitmentOutput {
    pub nonces: Vec<u8>,
    pub commitments: Vec<u8>,
    pub identifier: Vec<u8>,
}

/// Output from a signing round 2 (signature share)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureShareOutput {
    pub signature_share: Vec<u8>,
    pub identifier: Vec<u8>,
}

/// Final aggregated signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureOutput {
    pub signature: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct SignRound1Input {
    pub key_package: KeyPackageRaw,
}

#[derive(Serialize, Deserialize)]
pub struct SignRound2Input {
    pub message: Vec<u8>,
    pub key_package: KeyPackageRaw,
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
    pub public_key_package: PublicKeyPackageRaw,
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
    pub public_key_package: PublicKeyPackageRaw,
}

fn sign_round1_inner(key_package_raw: &KeyPackageRaw) -> Result<SigningCommitmentOutput, String> {
    let mut rng = OsRng;

    let key_package = key_package_raw.to_key_package()?;

    let (nonces, commitments) = frost::round1::commit(key_package.signing_share(), &mut rng);

    let nonces_bytes = nonces.serialize().map_err(|e| e.to_string())?;
    let commitments_bytes = commitments.serialize().map_err(|e| e.to_string())?;
    let identifier_bytes = key_package.identifier().serialize().to_vec();

    Ok(SigningCommitmentOutput {
        nonces: nonces_bytes,
        commitments: commitments_bytes,
        identifier: identifier_bytes,
    })
}

fn sign_round2_inner(
    message: &[u8],
    key_package_raw: &KeyPackageRaw,
    nonces_bytes: &[u8],
    all_commitments: &[(Vec<u8>, Vec<u8>)],
) -> Result<SignatureShareOutput, String> {
    let key_package = key_package_raw.to_key_package()?;

    let nonces = SigningNonces::deserialize(nonces_bytes).map_err(|e| e.to_string())?;

    let mut commitments_map: BTreeMap<Identifier, SigningCommitments> = BTreeMap::new();
    for (id_bytes, comm_bytes) in all_commitments {
        let identifier = Identifier::deserialize(id_bytes).map_err(|e| e.to_string())?;
        let commitments = SigningCommitments::deserialize(comm_bytes).map_err(|e| e.to_string())?;
        commitments_map.insert(identifier, commitments);
    }

    let signing_package = SigningPackage::new(commitments_map, message);

    let signature_share =
        frost::round2::sign(&signing_package, &nonces, &key_package).map_err(|e| e.to_string())?;

    let signature_share_bytes = signature_share.serialize();
    let identifier_bytes = key_package.identifier().serialize().to_vec();

    Ok(SignatureShareOutput {
        signature_share: signature_share_bytes,
        identifier: identifier_bytes,
    })
}

fn aggregate_inner(
    message: &[u8],
    all_commitments: &[(Vec<u8>, Vec<u8>)],
    all_signature_shares: &[(Vec<u8>, Vec<u8>)],
    public_key_package_raw: &PublicKeyPackageRaw,
) -> Result<SignatureOutput, String> {
    let pubkey_package = public_key_package_raw.to_public_key_package()?;

    let mut commitments_map: BTreeMap<Identifier, SigningCommitments> = BTreeMap::new();
    for (id_bytes, comm_bytes) in all_commitments {
        let identifier = Identifier::deserialize(id_bytes).map_err(|e| e.to_string())?;
        let commitments = SigningCommitments::deserialize(comm_bytes).map_err(|e| e.to_string())?;
        commitments_map.insert(identifier, commitments);
    }

    let signing_package = SigningPackage::new(commitments_map, message);

    let mut signature_shares: BTreeMap<Identifier, SignatureShare> = BTreeMap::new();
    for (id_bytes, share_bytes) in all_signature_shares {
        let identifier = Identifier::deserialize(id_bytes).map_err(|e| e.to_string())?;
        let share = SignatureShare::deserialize(share_bytes).map_err(|e| e.to_string())?;
        signature_shares.insert(identifier, share);
    }

    let signature = frost::aggregate(&signing_package, &signature_shares, &pubkey_package)
        .map_err(|e| e.to_string())?;

    let signature_bytes = signature.serialize().map_err(|e| e.to_string())?;

    Ok(SignatureOutput {
        signature: signature_bytes,
    })
}

fn verify_inner(
    message: &[u8],
    signature_bytes: &[u8],
    public_key_package_raw: &PublicKeyPackageRaw,
) -> Result<bool, String> {
    let pubkey_package = public_key_package_raw.to_public_key_package()?;

    let signature_array: [u8; 64] = signature_bytes
        .try_into()
        .map_err(|_| "Invalid signature length".to_string())?;

    let signature = frost::Signature::deserialize(&signature_array).map_err(|e| e.to_string())?;

    let verifying_key = pubkey_package.verifying_key();
    match verifying_key.verify(message, &signature) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[wasm_bindgen]
pub fn cli_sign_round1_ed25519(input: JsValue) -> Result<JsValue, JsValue> {
    let input: SignRound1Input = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    let out = sign_round1_inner(&input.key_package).map_err(|err| JsValue::from_str(&err))?;
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

    let out = sign_round2_inner(
        &input.message,
        &input.key_package,
        &input.nonces,
        &all_commitments,
    )
    .map_err(|err| JsValue::from_str(&err))?;

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

    let out = aggregate_inner(
        &input.message,
        &all_commitments,
        &all_signature_shares,
        &input.public_key_package,
    )
    .map_err(|err| JsValue::from_str(&err))?;

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_verify_ed25519(input: JsValue) -> Result<bool, JsValue> {
    let input: VerifyInput = input
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid input format: {}", err)))?;

    verify_inner(&input.message, &input.signature, &input.public_key_package)
        .map_err(|err| JsValue::from_str(&err))
}
