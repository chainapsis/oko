use frost::keys::KeyPackage;
use frost_ed25519_keplr as frost;
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Output from centralized key generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralizedKeygenOutput {
    pub private_key: Vec<u8>,
    pub keygen_outputs: Vec<KeygenOutput>,
    pub public_key: Vec<u8>,
}

/// A single participant's key share
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeygenOutput {
    pub key_package: Vec<u8>,
    pub public_key_package: Vec<u8>,
    pub identifier: Vec<u8>,
}

fn keygen_centralized_inner() -> Result<CentralizedKeygenOutput, String> {
    let mut rng = OsRng;
    let max_signers = 2;
    let min_signers = 2;

    let (shares, pubkey_package) = frost::keys::generate_with_dealer(
        max_signers,
        min_signers,
        frost::keys::IdentifierList::Default,
        &mut rng,
    )
    .map_err(|e| e.to_string())?;

    let pubkey_package_bytes = pubkey_package.serialize().map_err(|e| e.to_string())?;
    let verifying_key = pubkey_package.verifying_key();
    let public_key_bytes = verifying_key.serialize().map_err(|e| e.to_string())?;

    let mut keygen_outputs = Vec::with_capacity(shares.len());
    for (identifier, secret_share) in shares {
        let key_package = KeyPackage::try_from(secret_share).map_err(|e| e.to_string())?;
        let key_package_bytes = key_package.serialize().map_err(|e| e.to_string())?;
        let identifier_bytes = identifier.serialize().to_vec();

        keygen_outputs.push(KeygenOutput {
            key_package: key_package_bytes,
            public_key_package: pubkey_package_bytes.clone(),
            identifier: identifier_bytes,
        });
    }

    Ok(CentralizedKeygenOutput {
        private_key: vec![0u8; 32],
        keygen_outputs,
        public_key: public_key_bytes,
    })
}

fn keygen_import_inner(secret: [u8; 32]) -> Result<CentralizedKeygenOutput, String> {
    let mut rng = OsRng;
    let max_signers = 2;
    let min_signers = 2;

    let signing_key = frost::SigningKey::deserialize(&secret)
        .map_err(|e| format!("Invalid secret key: {}", e))?;

    let (shares, pubkey_package) = frost::keys::split(
        &signing_key,
        max_signers,
        min_signers,
        frost::keys::IdentifierList::Default,
        &mut rng,
    )
    .map_err(|e| e.to_string())?;

    let pubkey_package_bytes = pubkey_package.serialize().map_err(|e| e.to_string())?;
    let verifying_key = pubkey_package.verifying_key();
    let public_key_bytes = verifying_key.serialize().map_err(|e| e.to_string())?;

    let mut keygen_outputs = Vec::with_capacity(shares.len());
    for (identifier, secret_share) in shares {
        let key_package = KeyPackage::try_from(secret_share).map_err(|e| e.to_string())?;
        let key_package_bytes = key_package.serialize().map_err(|e| e.to_string())?;
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

#[wasm_bindgen]
pub fn cli_keygen_centralized_ed25519() -> Result<JsValue, JsValue> {
    let out = keygen_centralized_inner().map_err(|err| JsValue::from_str(&err))?;
    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn cli_keygen_import_ed25519(secret_key: JsValue) -> Result<JsValue, JsValue> {
    let secret: [u8; 32] = secret_key
        .into_serde()
        .map_err(|err| JsValue::from_str(&format!("Invalid secret key format: {}", err)))?;

    let out = keygen_import_inner(secret).map_err(|err| JsValue::from_str(&err))?;
    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
