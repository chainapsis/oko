//! Key extraction and reconstruction functions for Ed25519 FROST recovery.

use frost_ed25519_keplr::keys::{
    KeyPackage, PublicKeyPackage, SigningShare, VerifyingShare,
};
use frost_ed25519_keplr::Identifier;
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

/// Extract the signing_share (32 bytes) from a serialized KeyPackage.
///
/// This is used to backup the user's signing share on KS nodes via SSS.
/// The signing_share is the secret scalar value that must be protected.
#[wasm_bindgen]
pub fn extract_signing_share(key_package: JsValue) -> Result<JsValue, JsValue> {
    let key_package_bytes: Vec<u8> = key_package
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid key_package format: {}", err)))?;

    let key_package = KeyPackage::deserialize(&key_package_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize KeyPackage: {}", e)))?;

    // Extract the signing share (32-byte scalar)
    let signing_share_bytes = key_package.signing_share().serialize();

    JsValue::from_serde(&signing_share_bytes)
        .map_err(|err| JsValue::from_str(&err.to_string()))
}

/// Reconstruct a KeyPackage from a signing_share, public_key_package, and identifier.
///
/// This is used during recovery: after SSS-combining the signing_share from KS nodes,
/// we need to rebuild the full KeyPackage to use for signing.
///
/// The verifying_share is derived from signing_share (verifying_share = signing_share * G).
/// The verifying_key comes from the PublicKeyPackage.
/// min_signers is always 2 (hardcoded for 2-of-2 scheme).
#[wasm_bindgen]
pub fn reconstruct_key_package(
    signing_share: JsValue,
    public_key_package: JsValue,
    identifier: JsValue,
) -> Result<JsValue, JsValue> {
    // Parse inputs
    let signing_share_bytes: Vec<u8> = signing_share
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid signing_share format: {}", err)))?;

    let public_key_package_bytes: Vec<u8> = public_key_package
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid public_key_package format: {}", err)))?;

    let identifier_bytes: Vec<u8> = identifier
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid identifier format: {}", err)))?;

    // Deserialize components
    let signing_share = SigningShare::deserialize(&signing_share_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize signing_share: {}", e)))?;

    let pubkey_package = PublicKeyPackage::deserialize(&public_key_package_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize public_key_package: {}", e)))?;

    let identifier = Identifier::deserialize(&identifier_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize identifier: {}", e)))?;

    // Derive verifying_share from signing_share: verifying_share = signing_share * G
    // This is implemented via From<SigningShare> for VerifyingShare
    let verifying_share: VerifyingShare = signing_share.clone().into();

    // Get the group verifying key from PublicKeyPackage
    let verifying_key = *pubkey_package.verifying_key();

    // Construct the KeyPackage
    // min_signers = 2 for our 2-of-2 scheme
    let key_package = KeyPackage::new(
        identifier,
        signing_share,
        verifying_share,
        verifying_key,
        2, // min_signers
    );

    // Serialize and return
    let key_package_bytes = key_package
        .serialize()
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize KeyPackage: {}", e)))?;

    JsValue::from_serde(&key_package_bytes)
        .map_err(|err| JsValue::from_str(&err.to_string()))
}
