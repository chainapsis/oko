use frost::keys::{KeyPackage, PublicKeyPackage};
use frost::round1::{SigningCommitments, SigningNonces};
use frost::round2::SignatureShare;
use frost::{Identifier, SigningPackage};
use frost_ed25519_keplr as frost;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Output from a signing round 1 (commitment)
#[napi(object)]
#[derive(Debug, Clone)]
pub struct NapiSigningCommitmentOutput {
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

fn sign_round1_inner(
    key_package_bytes: &[u8],
) -> std::result::Result<NapiSigningCommitmentOutput, String> {
    let mut rng = OsRng;

    let key_package = KeyPackage::deserialize(key_package_bytes).map_err(|e| e.to_string())?;

    let (nonces, commitments) = frost::round1::commit(key_package.signing_share(), &mut rng);

    let nonces_bytes = nonces.serialize().map_err(|e| e.to_string())?;
    let commitments_bytes = commitments.serialize().map_err(|e| e.to_string())?;
    let identifier_bytes = key_package.identifier().serialize().to_vec();

    Ok(NapiSigningCommitmentOutput {
        nonces: nonces_bytes,
        commitments: commitments_bytes,
        identifier: identifier_bytes,
    })
}

fn sign_round2_inner(
    message: &[u8],
    key_package_bytes: &[u8],
    nonces_bytes: &[u8],
    all_commitments: &[(Vec<u8>, Vec<u8>)],
) -> std::result::Result<SignatureShareOutput, String> {
    let key_package = KeyPackage::deserialize(key_package_bytes).map_err(|e| e.to_string())?;

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
    public_key_package_bytes: &[u8],
) -> std::result::Result<SignatureOutput, String> {
    let pubkey_package =
        PublicKeyPackage::deserialize(public_key_package_bytes).map_err(|e| e.to_string())?;

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
    public_key_package_bytes: &[u8],
) -> std::result::Result<bool, String> {
    let pubkey_package =
        PublicKeyPackage::deserialize(public_key_package_bytes).map_err(|e| e.to_string())?;

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

/// Round 1: Generate signing commitments for a participant.
#[napi]
pub fn napi_sign_round1_ed25519(key_package: Vec<u8>) -> Result<NapiSigningCommitmentOutput> {
    sign_round1_inner(&key_package).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sign_round1 error: {:?}", e),
        )
    })
}

/// Round 2: Generate a signature share for a participant.
#[napi]
pub fn napi_sign_round2_ed25519(
    message: Vec<u8>,
    key_package: Vec<u8>,
    nonces: Vec<u8>,
    all_commitments: serde_json::Value,
) -> Result<serde_json::Value> {
    let commitments: Vec<CommitmentEntry> =
        serde_json::from_value(all_commitments).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (all_commitments): {:?}", e),
            )
        })?;

    let commitments_vec: Vec<(Vec<u8>, Vec<u8>)> = commitments
        .into_iter()
        .map(|c| (c.identifier, c.commitments))
        .collect();

    let output =
        sign_round2_inner(&message, &key_package, &nonces, &commitments_vec).map_err(|e| {
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
#[napi]
pub fn napi_aggregate_ed25519(
    message: Vec<u8>,
    all_commitments: serde_json::Value,
    all_signature_shares: serde_json::Value,
    public_key_package: Vec<u8>,
) -> Result<serde_json::Value> {
    let commitments: Vec<CommitmentEntry> =
        serde_json::from_value(all_commitments).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (all_commitments): {:?}", e),
            )
        })?;

    let sig_shares: Vec<SignatureShareEntry> = serde_json::from_value(all_signature_shares)
        .map_err(|e| {
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

    let output = aggregate_inner(
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
#[napi]
pub fn napi_verify_ed25519(
    message: Vec<u8>,
    signature: Vec<u8>,
    public_key_package: Vec<u8>,
) -> Result<bool> {
    verify_inner(&message, &signature, &public_key_package).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("verify error: {:?}", e),
        )
    })
}
