use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use teddsa_core::{aggregate, sign_round1, sign_round2, verify};

/// Commitment entry for signing
#[derive(Serialize, Deserialize)]
pub struct CommitmentEntry {
    pub identifier: Vec<u8>,
    pub commitments: Vec<u8>,
}

/// Signature share entry for aggregation
#[derive(Serialize, Deserialize)]
pub struct SignatureShareEntry {
    pub identifier: Vec<u8>,
    pub signature_share: Vec<u8>,
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
#[napi]
pub fn napi_sign_round1_ed25519(key_package: Vec<u8>) -> Result<serde_json::Value> {
    let output = sign_round1(&key_package).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sign_round1 error: {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

/// Round 2: Generate a signature share for a participant.
///
/// # Arguments
/// * `message` - Message to sign
/// * `key_package` - The participant's serialized KeyPackage
/// * `nonces` - Nonces from round 1
/// * `all_commitments` - JSON array of CommitmentEntry objects
#[napi]
pub fn napi_sign_round2_ed25519(
    message: Vec<u8>,
    key_package: Vec<u8>,
    nonces: Vec<u8>,
    all_commitments: serde_json::Value,
) -> Result<serde_json::Value> {
    let commitments: Vec<CommitmentEntry> = serde_json::from_value(all_commitments).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (all_commitments): {:?}", e),
        )
    })?;

    let commitments_vec: Vec<(Vec<u8>, Vec<u8>)> = commitments
        .into_iter()
        .map(|c| (c.identifier, c.commitments))
        .collect();

    let output = sign_round2(&message, &key_package, &nonces, &commitments_vec).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sign_round2 error: {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

/// Aggregate signature shares into a final threshold signature.
///
/// # Arguments
/// * `message` - Message that was signed
/// * `all_commitments` - JSON array of CommitmentEntry objects
/// * `all_signature_shares` - JSON array of SignatureShareEntry objects
/// * `public_key_package` - Serialized PublicKeyPackage
///
/// Returns a JSON object containing:
/// - `signature`: The 64-byte Ed25519 signature
#[napi]
pub fn napi_aggregate_ed25519(
    message: Vec<u8>,
    all_commitments: serde_json::Value,
    all_signature_shares: serde_json::Value,
    public_key_package: Vec<u8>,
) -> Result<serde_json::Value> {
    let commitments: Vec<CommitmentEntry> = serde_json::from_value(all_commitments).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (all_commitments): {:?}", e),
        )
    })?;

    let sig_shares: Vec<SignatureShareEntry> =
        serde_json::from_value(all_signature_shares).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (all_signature_shares): {:?}", e),
            )
        })?;

    let commitments_vec: Vec<(Vec<u8>, Vec<u8>)> = commitments
        .into_iter()
        .map(|c| (c.identifier, c.commitments))
        .collect();

    let sig_shares_vec: Vec<(Vec<u8>, Vec<u8>)> = sig_shares
        .into_iter()
        .map(|s| (s.identifier, s.signature_share))
        .collect();

    let output = aggregate(
        &message,
        &commitments_vec,
        &sig_shares_vec,
        &public_key_package,
    )
    .map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("aggregate error: {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

/// Verify a signature against a public key.
///
/// # Arguments
/// * `message` - Original message
/// * `signature` - 64-byte Ed25519 signature
/// * `public_key_package` - Serialized PublicKeyPackage
///
/// Returns `true` if the signature is valid, `false` otherwise.
#[napi]
pub fn napi_verify_ed25519(
    message: Vec<u8>,
    signature: Vec<u8>,
    public_key_package: Vec<u8>,
) -> Result<bool> {
    verify(&message, &signature, &public_key_package).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("verify error: {:?}", e),
        )
    })
}
