use napi::bindgen_prelude::*;
use napi_derive::napi;
use teddsa_core::{keygen_centralized, keygen_import};

/// Generate a 2-of-2 threshold Ed25519 key using centralized key generation.
///
/// Returns a JSON object containing:
/// - `keygen_outputs`: Array of two key shares
/// - `public_key`: The Ed25519 public key (32 bytes)
/// - `private_key`: The original private key (for backup purposes only)
#[napi]
pub fn napi_keygen_centralized_ed25519() -> Result<serde_json::Value> {
    let output = keygen_centralized().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen_centralized error: {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

/// Import an existing Ed25519 secret key and split it into threshold shares.
///
/// # Arguments
/// * `secret_key` - A 32-byte array representing the Ed25519 secret key
#[napi]
pub fn napi_keygen_import_ed25519(secret_key: Vec<u8>) -> Result<serde_json::Value> {
    if secret_key.len() != 32 {
        return Err(napi::Error::new(
            napi::Status::InvalidArg,
            "secret_key must be exactly 32 bytes",
        ));
    }

    let mut secret_arr = [0u8; 32];
    secret_arr.copy_from_slice(&secret_key);

    let output = keygen_import(secret_arr).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen_import error: {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}
