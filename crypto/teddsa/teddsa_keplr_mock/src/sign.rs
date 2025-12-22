use frost::keys::{KeyPackage, PublicKeyPackage};
use frost::round1::{SigningCommitments, SigningNonces};
use frost::round2::SignatureShare;
use frost::{Identifier, SigningPackage};
use frost_ed25519_keplr as frost;
use rand_core::OsRng;
use std::collections::BTreeMap;

use crate::error::FrostError;
use crate::types::{SignatureOutput, SignatureShareOutput, SigningCommitmentOutput};

/// Round 1: Generate signing commitments for a participant.
///
/// Each participant calls this function to generate their nonces and commitments.
/// The nonces must be kept secret and used in round 2.
/// The commitments are sent to the coordinator.
pub fn sign_round1(key_package_bytes: &[u8]) -> Result<SigningCommitmentOutput, FrostError> {
    let mut rng = OsRng;

    // Deserialize key package
    let key_package = KeyPackage::deserialize(key_package_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Generate nonces and commitments
    let (nonces, commitments) = frost::round1::commit(key_package.signing_share(), &mut rng);

    // Serialize outputs
    let nonces_bytes = nonces
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    let commitments_bytes = commitments
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    let identifier_bytes = key_package.identifier().serialize().to_vec();

    Ok(SigningCommitmentOutput {
        nonces: nonces_bytes,
        commitments: commitments_bytes,
        identifier: identifier_bytes,
    })
}

/// Round 2: Generate a signature share for a participant.
///
/// After receiving commitments from all participants, the coordinator creates
/// a SigningPackage and distributes it. Each participant then generates their
/// signature share.
pub fn sign_round2(
    message: &[u8],
    key_package_bytes: &[u8],
    nonces_bytes: &[u8],
    all_commitments: &[(Vec<u8>, Vec<u8>)], // Vec of (identifier, commitments)
) -> Result<SignatureShareOutput, FrostError> {
    // Deserialize key package
    let key_package = KeyPackage::deserialize(key_package_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Deserialize nonces
    let nonces = SigningNonces::deserialize(nonces_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Deserialize all commitments
    let mut commitments_map: BTreeMap<Identifier, SigningCommitments> = BTreeMap::new();
    for (id_bytes, comm_bytes) in all_commitments {
        let identifier = Identifier::deserialize(id_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        let commitments = SigningCommitments::deserialize(comm_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        commitments_map.insert(identifier, commitments);
    }

    // Create signing package
    let signing_package = SigningPackage::new(commitments_map, message);

    // Generate signature share
    let signature_share = frost::round2::sign(&signing_package, &nonces, &key_package)
        .map_err(|e| FrostError::Round2Error(e.to_string()))?;

    // Serialize outputs
    let signature_share_bytes = signature_share.serialize();

    let identifier_bytes = key_package.identifier().serialize().to_vec();

    Ok(SignatureShareOutput {
        signature_share: signature_share_bytes,
        identifier: identifier_bytes,
    })
}

/// Aggregate signature shares into a final threshold signature.
///
/// The coordinator calls this function after receiving signature shares
/// from all participants.
pub fn aggregate(
    message: &[u8],
    all_commitments: &[(Vec<u8>, Vec<u8>)], // Vec of (identifier, commitments)
    all_signature_shares: &[(Vec<u8>, Vec<u8>)], // Vec of (identifier, signature_share)
    public_key_package_bytes: &[u8],
) -> Result<SignatureOutput, FrostError> {
    // Deserialize public key package
    let pubkey_package = PublicKeyPackage::deserialize(public_key_package_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Deserialize all commitments
    let mut commitments_map: BTreeMap<Identifier, SigningCommitments> = BTreeMap::new();
    for (id_bytes, comm_bytes) in all_commitments {
        let identifier = Identifier::deserialize(id_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        let commitments = SigningCommitments::deserialize(comm_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        commitments_map.insert(identifier, commitments);
    }

    // Create signing package
    let signing_package = SigningPackage::new(commitments_map, message);

    // Deserialize all signature shares
    let mut signature_shares: BTreeMap<Identifier, SignatureShare> = BTreeMap::new();
    for (id_bytes, share_bytes) in all_signature_shares {
        let identifier = Identifier::deserialize(id_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        let share = SignatureShare::deserialize(share_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;
        signature_shares.insert(identifier, share);
    }

    // Aggregate signature
    let signature = frost::aggregate(&signing_package, &signature_shares, &pubkey_package)
        .map_err(|e| FrostError::AggregationError(e.to_string()))?;

    // Serialize signature (64 bytes for Ed25519)
    let signature_bytes = signature
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    Ok(SignatureOutput {
        signature: signature_bytes,
    })
}

/// Verify a signature against a public key.
pub fn verify(
    message: &[u8],
    signature_bytes: &[u8],
    public_key_package_bytes: &[u8],
) -> Result<bool, FrostError> {
    // Deserialize public key package
    let pubkey_package = PublicKeyPackage::deserialize(public_key_package_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Deserialize signature
    let signature_array: [u8; 64] = signature_bytes
        .try_into()
        .map_err(|_| FrostError::DeserializationError("Invalid signature length".to_string()))?;

    let signature = frost::Signature::deserialize(&signature_array)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Verify
    let verifying_key = pubkey_package.verifying_key();
    match verifying_key.verify(message, &signature) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::keygen_centralized::keygen_centralized;

    #[test]
    fn test_full_signing_flow() {
        // Step 1: Generate keys
        let keygen_output = keygen_centralized().expect("keygen should succeed");
        assert_eq!(keygen_output.keygen_outputs.len(), 2);

        let key_package_1 = &keygen_output.keygen_outputs[0];
        let key_package_2 = &keygen_output.keygen_outputs[1];

        // Step 2: Round 1 - Generate commitments
        let round1_output_1 =
            sign_round1(&key_package_1.key_package).expect("round1 should succeed");
        let round1_output_2 =
            sign_round1(&key_package_2.key_package).expect("round1 should succeed");

        // Collect all commitments
        let all_commitments = vec![
            (
                round1_output_1.identifier.clone(),
                round1_output_1.commitments.clone(),
            ),
            (
                round1_output_2.identifier.clone(),
                round1_output_2.commitments.clone(),
            ),
        ];

        // Step 3: Round 2 - Generate signature shares
        let message = b"test message";

        let round2_output_1 = sign_round2(
            message,
            &key_package_1.key_package,
            &round1_output_1.nonces,
            &all_commitments,
        )
        .expect("round2 should succeed");

        let round2_output_2 = sign_round2(
            message,
            &key_package_2.key_package,
            &round1_output_2.nonces,
            &all_commitments,
        )
        .expect("round2 should succeed");

        // Collect all signature shares
        let all_signature_shares = vec![
            (
                round2_output_1.identifier.clone(),
                round2_output_1.signature_share.clone(),
            ),
            (
                round2_output_2.identifier.clone(),
                round2_output_2.signature_share.clone(),
            ),
        ];

        // Step 4: Aggregate signature
        let signature_output = aggregate(
            message,
            &all_commitments,
            &all_signature_shares,
            &key_package_1.public_key_package,
        )
        .expect("aggregation should succeed");

        // Step 5: Verify signature
        let is_valid = verify(
            message,
            &signature_output.signature,
            &key_package_1.public_key_package,
        )
        .expect("verification should not error");

        assert!(is_valid, "signature should be valid");
        assert_eq!(signature_output.signature.len(), 64);
    }
}
