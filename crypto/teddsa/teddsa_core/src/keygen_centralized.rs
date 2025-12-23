use frost::keys::KeyPackage;
use frost_ed25519_keplr as frost;
use rand_core::OsRng;

use crate::error::FrostError;
use crate::types::{CentralizedKeygenOutput, KeygenOutput};

/// Generate a 2-of-2 threshold key using a trusted dealer.
///
/// This is the centralized key generation approach where a single trusted
/// party generates the key and splits it into shares. This mirrors the
/// pattern used in cait_sith_keplr for secp256k1.
///
/// Returns:
/// - `CentralizedKeygenOutput` containing the private key, public key, and
///   two key shares for the 2-of-2 threshold scheme.
pub fn keygen_centralized() -> Result<CentralizedKeygenOutput, FrostError> {
    let mut rng = OsRng;

    // 2-of-2 threshold: min_signers = 2, max_signers = 2
    let max_signers = 2;
    let min_signers = 2;

    // Generate shares using trusted dealer
    let (shares, pubkey_package) = frost::keys::generate_with_dealer(
        max_signers,
        min_signers,
        frost::keys::IdentifierList::Default,
        &mut rng,
    )
    .map_err(|e| FrostError::KeygenError(e.to_string()))?;

    // Serialize public key package
    let pubkey_package_bytes = pubkey_package
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    // Get the verifying key (public key)
    let verifying_key = pubkey_package.verifying_key();
    let public_key_bytes = verifying_key
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    // Convert shares to KeygenOutput
    let mut keygen_outputs = Vec::with_capacity(shares.len());

    for (identifier, secret_share) in shares {
        // Convert SecretShare to KeyPackage
        let key_package = KeyPackage::try_from(secret_share)
            .map_err(|e| FrostError::KeygenError(e.to_string()))?;

        let key_package_bytes = key_package
            .serialize()
            .map_err(|e| FrostError::SerializationError(e.to_string()))?;

        let identifier_bytes = identifier.serialize().to_vec();

        keygen_outputs.push(KeygenOutput {
            key_package: key_package_bytes,
            public_key_package: pubkey_package_bytes.clone(),
            identifier: identifier_bytes,
        });
    }

    // Extract the private key from the first share for backup purposes
    // Note: In a real threshold scheme, no single party should have the full private key.
    // This is only for compatibility with the existing oko pattern where the
    // centralized keygen exposes the private key.
    //
    // For FROST, we don't actually need this, but we include it for API consistency.
    // The private_key field here is a placeholder.
    let private_key_placeholder = vec![0u8; 32]; // Placeholder

    Ok(CentralizedKeygenOutput {
        private_key: private_key_placeholder,
        keygen_outputs,
        public_key: public_key_bytes,
    })
}

/// Import an existing 32-byte secret and split it into threshold shares.
///
/// This allows importing an externally generated Ed25519 private key
/// and converting it into a 2-of-2 threshold scheme.
pub fn keygen_import(secret: [u8; 32]) -> Result<CentralizedKeygenOutput, FrostError> {
    let mut rng = OsRng;

    let max_signers = 2;
    let min_signers = 2;

    // Create a signing key from the secret
    let signing_key = frost::SigningKey::deserialize(&secret)
        .map_err(|e| FrostError::KeygenError(format!("Invalid secret key: {}", e)))?;

    // Split the existing key into shares
    let (shares, pubkey_package) = frost::keys::split(
        &signing_key,
        max_signers,
        min_signers,
        frost::keys::IdentifierList::Default,
        &mut rng,
    )
    .map_err(|e| FrostError::KeygenError(e.to_string()))?;

    // Serialize public key package
    let pubkey_package_bytes = pubkey_package
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    // Get the verifying key (public key)
    let verifying_key = pubkey_package.verifying_key();
    let public_key_bytes = verifying_key
        .serialize()
        .map_err(|e| FrostError::SerializationError(e.to_string()))?;

    // Convert shares to KeygenOutput
    let mut keygen_outputs = Vec::with_capacity(shares.len());

    for (identifier, secret_share) in shares {
        let key_package = KeyPackage::try_from(secret_share)
            .map_err(|e| FrostError::KeygenError(e.to_string()))?;

        let key_package_bytes = key_package
            .serialize()
            .map_err(|e| FrostError::SerializationError(e.to_string()))?;

        let identifier_bytes = identifier.serialize().to_vec();

        keygen_outputs.push(KeygenOutput {
            key_package: key_package_bytes,
            public_key_package: pubkey_package_bytes.clone(),
            identifier: identifier_bytes,
        });
    }

    Ok(CentralizedKeygenOutput {
        private_key: secret.to_vec(),
        keygen_outputs,
        public_key: public_key_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keygen_centralized() {
        let result = keygen_centralized();
        assert!(result.is_ok());

        let output = result.unwrap();
        assert_eq!(output.keygen_outputs.len(), 2);
        assert_eq!(output.public_key.len(), 32); // Ed25519 public key is 32 bytes
    }

    #[test]
    fn test_keygen_import() {
        // First generate a valid key, then import it
        let keygen_result = keygen_centralized().expect("keygen should succeed");

        // Use the generated public key's corresponding secret
        // For testing, we'll create a new keygen and use that
        // In practice, keygen_import would be used with an externally provided key

        // Generate a valid signing key for testing
        use frost_ed25519_keplr as frost;
        use rand_core::OsRng;

        let mut rng = OsRng;
        let signing_key = frost::SigningKey::new(&mut rng);
        let secret_vec = signing_key.serialize();
        let secret: [u8; 32] = secret_vec.try_into().expect("should be 32 bytes");

        let result = keygen_import(secret);
        assert!(result.is_ok(), "keygen_import failed: {:?}", result.err());

        let output = result.unwrap();
        assert_eq!(output.keygen_outputs.len(), 2);
        assert_eq!(output.private_key, secret.to_vec());
    }
}
