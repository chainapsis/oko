//! SSS (Shamir's Secret Sharing) operations for Ed25519 key packages.
//!
//! This module provides functionality to:
//! - Extract the signing_share from a serialized KeyPackage
//! - Split the signing_share using Shamir's Secret Sharing
//! - Combine shares to recover the signing_share
//! - Reconstruct a KeyPackage from the recovered signing_share and public info

use frost_ed25519_keplr as frost;
use frost_ed25519_keplr::{sss_combine_ed25519, sss_split_ed25519, Point256};
use rand_core::OsRng;

use crate::error::FrostError;

/// Extract the signing_share (32-byte scalar) from a serialized KeyPackage.
pub fn extract_signing_share(key_package_bytes: &[u8]) -> Result<[u8; 32], FrostError> {
    let key_package = frost::keys::KeyPackage::deserialize(key_package_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    let signing_share = key_package.signing_share();
    let scalar_bytes = signing_share.to_scalar().to_bytes();

    Ok(scalar_bytes)
}

/// Split a 32-byte secret into shares using Shamir's Secret Sharing.
///
/// # Arguments
/// * `secret` - The 32-byte secret (signing_share scalar)
/// * `point_xs` - Identifiers for each share (each 32 bytes, derived from KS node names)
/// * `threshold` - Minimum number of shares required to reconstruct
///
/// # Returns
/// A vector of Point256, where each point contains:
/// - `x`: The identifier (32 bytes)
/// - `y`: The share value (32 bytes)
pub fn sss_split(
    secret: [u8; 32],
    point_xs: Vec<[u8; 32]>,
    threshold: u32,
) -> Result<Vec<Point256>, FrostError> {
    let mut rng = OsRng;

    sss_split_ed25519(secret, point_xs, threshold, &mut rng)
        .map_err(|e| FrostError::SssError(e))
}

/// Combine shares to recover the original 32-byte secret.
///
/// # Arguments
/// * `points` - The shares to combine, each containing x (identifier) and y (share value)
/// * `threshold` - The threshold used during splitting
///
/// # Returns
/// The recovered 32-byte secret (signing_share scalar)
pub fn sss_combine(points: Vec<Point256>, threshold: u32) -> Result<[u8; 32], FrostError> {
    sss_combine_ed25519(points, threshold).map_err(|e| FrostError::SssError(e))
}

/// Reconstruct a KeyPackage from a signing_share and public information.
///
/// This allows recovering a full KeyPackage after SSS reconstruction.
///
/// # Arguments
/// * `signing_share_bytes` - The recovered 32-byte signing_share scalar
/// * `public_key_package_bytes` - Serialized PublicKeyPackage
/// * `identifier_bytes` - The participant's identifier
///
/// # Returns
/// The reconstructed and serialized KeyPackage
pub fn reconstruct_key_package(
    signing_share_bytes: [u8; 32],
    public_key_package_bytes: &[u8],
    identifier_bytes: &[u8],
) -> Result<Vec<u8>, FrostError> {
    // Deserialize the public key package
    let public_key_package =
        frost::keys::PublicKeyPackage::deserialize(public_key_package_bytes)
            .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Deserialize the identifier
    let identifier_arr: [u8; 32] = identifier_bytes
        .try_into()
        .map_err(|_| FrostError::DeserializationError("Invalid identifier length".to_string()))?;
    let identifier = frost::Identifier::deserialize(&identifier_arr)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Create the signing share
    let signing_share = frost::keys::SigningShare::deserialize(&signing_share_bytes)
        .map_err(|e| FrostError::DeserializationError(e.to_string()))?;

    // Get the verifying share for this identifier from the public key package
    let verifying_shares = public_key_package.verifying_shares();
    let verifying_share = verifying_shares
        .get(&identifier)
        .ok_or_else(|| FrostError::KeygenError("Identifier not found in public key package".to_string()))?;

    // Get the verifying key
    let verifying_key = *public_key_package.verifying_key();

    // Reconstruct the KeyPackage
    // min_signers is 2 for our 2-of-2 threshold scheme
    let key_package = frost::keys::KeyPackage::new(
        identifier,
        signing_share,
        *verifying_share,
        verifying_key,
        2,
    );

    // Serialize and return
    key_package
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::keygen_centralized::keygen_centralized;

    #[test]
    fn test_extract_signing_share() {
        let keygen = keygen_centralized().expect("keygen should succeed");
        let key_package_bytes = &keygen.keygen_outputs[0].key_package;

        let result = extract_signing_share(key_package_bytes);
        assert!(result.is_ok());

        let signing_share = result.unwrap();
        assert_eq!(signing_share.len(), 32);
    }

    #[test]
    fn test_sss_split_and_combine() {
        let keygen = keygen_centralized().expect("keygen should succeed");
        let key_package_bytes = &keygen.keygen_outputs[0].key_package;

        // Extract signing share
        let signing_share = extract_signing_share(key_package_bytes).expect("should extract");

        // Create identifiers for 3 KS nodes
        let mut point_xs = vec![[0u8; 32]; 3];
        point_xs[0][31] = 1;
        point_xs[1][31] = 2;
        point_xs[2][31] = 3;

        // Split with threshold 2
        let shares = sss_split(signing_share, point_xs.clone(), 2).expect("should split");
        assert_eq!(shares.len(), 3);

        // Combine with 2 shares
        let recovered = sss_combine(shares[..2].to_vec(), 2).expect("should combine");
        assert_eq!(recovered, signing_share);
    }

    #[test]
    fn test_reconstruct_key_package() {
        let keygen = keygen_centralized().expect("keygen should succeed");
        let key_package_bytes = &keygen.keygen_outputs[0].key_package;
        let public_key_package_bytes = &keygen.keygen_outputs[0].public_key_package;
        let identifier_bytes = &keygen.keygen_outputs[0].identifier;

        // Extract signing share
        let signing_share = extract_signing_share(key_package_bytes).expect("should extract");

        // Create identifiers for 3 KS nodes
        let mut point_xs = vec![[0u8; 32]; 3];
        point_xs[0][31] = 1;
        point_xs[1][31] = 2;
        point_xs[2][31] = 3;

        // Split
        let shares = sss_split(signing_share, point_xs.clone(), 2).expect("should split");

        // Combine
        let recovered_share = sss_combine(shares[..2].to_vec(), 2).expect("should combine");

        // Reconstruct key package
        let reconstructed = reconstruct_key_package(
            recovered_share,
            public_key_package_bytes,
            identifier_bytes,
        )
        .expect("should reconstruct");

        // The reconstructed package should allow signing
        assert!(!reconstructed.is_empty());
    }
}
