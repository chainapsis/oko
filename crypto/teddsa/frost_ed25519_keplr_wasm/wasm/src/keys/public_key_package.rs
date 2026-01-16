use frost_ed25519_keplr::keys::{PublicKeyPackage, VerifyingShare};
use frost_ed25519_keplr::{Identifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

/// Entry for verifying_shares - using Vec instead of HashMap for better serde_wasm_bindgen compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyingShareEntry {
    pub identifier: String,
    pub share: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicKeyPackageRaw {
    /// Using Vec of entries instead of HashMap for serde_wasm_bindgen compatibility
    pub verifying_shares: Vec<VerifyingShareEntry>,
    pub verifying_key: Vec<u8>,
}

impl PublicKeyPackageRaw {
    pub fn from_public_key_package(pkg: &PublicKeyPackage) -> Result<Self, String> {
        let mut verifying_shares = Vec::new();

        for (identifier, verifying_share) in pkg.verifying_shares() {
            let id_hex = hex::encode(identifier.serialize());
            let share_bytes: Vec<u8> = verifying_share.serialize().map_err(|e| e.to_string())?;
            verifying_shares.push(VerifyingShareEntry {
                identifier: id_hex,
                share: share_bytes,
            });
        }

        let verifying_key: Vec<u8> = pkg.verifying_key().serialize().map_err(|e| e.to_string())?;

        Ok(Self {
            verifying_shares,
            verifying_key,
        })
    }

    pub fn to_public_key_package(&self) -> Result<PublicKeyPackage, String> {
        let mut verifying_shares: BTreeMap<Identifier, VerifyingShare> = BTreeMap::new();

        for entry in &self.verifying_shares {
            let id_bytes = hex::decode(&entry.identifier).map_err(|e| e.to_string())?;
            let identifier = Identifier::deserialize(&id_bytes).map_err(|e| e.to_string())?;
            let verifying_share =
                VerifyingShare::deserialize(&entry.share).map_err(|e| e.to_string())?;
            verifying_shares.insert(identifier, verifying_share);
        }

        let verifying_key =
            VerifyingKey::deserialize(&self.verifying_key).map_err(|e| e.to_string())?;

        Ok(PublicKeyPackage::new(verifying_shares, verifying_key))
    }

    /// Serialize to FROST library binary format
    pub fn to_frost_bytes(&self) -> Result<Vec<u8>, String> {
        let public_key_package = self.to_public_key_package()?;
        public_key_package.serialize().map_err(|e| e.to_string())
    }
}

/// Serialize a PublicKeyPackageRaw to FROST library binary format.
/// This is used when sending public_key_package to the backend API.
#[wasm_bindgen]
pub fn cli_serialize_public_key_package_ed25519(
    public_key_package_raw: JsValue,
) -> Result<JsValue, JsValue> {
    let raw: PublicKeyPackageRaw = serde_wasm_bindgen::from_value(public_key_package_raw)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse PublicKeyPackageRaw: {}", e)))?;

    let frost_bytes = raw
        .to_frost_bytes()
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize to FROST format: {}", e)))?;

    serde_wasm_bindgen::to_value(&frost_bytes).map_err(|e| JsValue::from_str(&e.to_string()))
}
