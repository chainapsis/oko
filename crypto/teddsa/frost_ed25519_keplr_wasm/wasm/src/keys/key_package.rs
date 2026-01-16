use frost_ed25519_keplr::keys::{KeyPackage, SigningShare, VerifyingShare};
use frost_ed25519_keplr::{Identifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPackageRaw {
    pub identifier: [u8; 32],
    pub signing_share: [u8; 32],
    pub verifying_share: [u8; 32],
    pub verifying_key: [u8; 32],
    pub min_signers: u16,
}

impl KeyPackageRaw {
    pub fn from_key_package(pkg: &KeyPackage) -> Result<Self, String> {
        let identifier: [u8; 32] = pkg
            .identifier()
            .serialize()
            .try_into()
            .map_err(|_| "Invalid identifier length")?;

        let signing_share: [u8; 32] = pkg
            .signing_share()
            .serialize()
            .try_into()
            .map_err(|_| "Invalid signing share length")?;

        let verifying_share: [u8; 32] = pkg
            .verifying_share()
            .serialize()
            .map_err(|e| e.to_string())?
            .try_into()
            .map_err(|_| "Invalid verifying share length")?;

        let verifying_key: [u8; 32] = pkg
            .verifying_key()
            .serialize()
            .map_err(|e| e.to_string())?
            .try_into()
            .map_err(|_| "Invalid verifying key length")?;

        Ok(Self {
            identifier,
            signing_share,
            verifying_share,
            verifying_key,
            min_signers: *pkg.min_signers(),
        })
    }

    pub fn to_key_package(&self) -> Result<KeyPackage, String> {
        let identifier = Identifier::deserialize(&self.identifier).map_err(|e| e.to_string())?;

        let signing_share =
            SigningShare::deserialize(&self.signing_share).map_err(|e| e.to_string())?;

        let verifying_share =
            VerifyingShare::deserialize(&self.verifying_share).map_err(|e| e.to_string())?;

        let verifying_key =
            VerifyingKey::deserialize(&self.verifying_key).map_err(|e| e.to_string())?;

        Ok(KeyPackage::new(
            identifier,
            signing_share,
            verifying_share,
            verifying_key,
            self.min_signers,
        ))
    }

    /// Serialize to FROST library binary format
    pub fn to_frost_bytes(&self) -> Result<Vec<u8>, String> {
        let key_package = self.to_key_package()?;
        key_package.serialize().map_err(|e| e.to_string())
    }
}

/// Serialize a KeyPackageRaw to FROST library binary format.
/// This is used when sending key_package to the backend API.
#[wasm_bindgen]
pub fn cli_serialize_key_package_ed25519(key_package_raw: JsValue) -> Result<JsValue, JsValue> {
    let raw: KeyPackageRaw = serde_wasm_bindgen::from_value(key_package_raw)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse KeyPackageRaw: {}", e)))?;

    let frost_bytes = raw
        .to_frost_bytes()
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize to FROST format: {}", e)))?;

    serde_wasm_bindgen::to_value(&frost_bytes).map_err(|e| JsValue::from_str(&e.to_string()))
}
