use frost::keys::KeyPackage;
use frost_ed25519_keplr as frost;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use rand_core::OsRng;

/// A single participant's key share
#[napi(object)]
#[derive(Debug, Clone)]
pub struct NapiKeygenOutput {
    #[napi(js_name = "key_package")]
    pub key_package: Vec<u8>,
    #[napi(js_name = "public_key_package")]
    pub public_key_package: Vec<u8>,
    pub identifier: Vec<u8>,
}

/// Output from centralized key generation
#[napi(object)]
#[derive(Debug, Clone)]
pub struct NapiCentralizedKeygenOutput {
    #[napi(js_name = "private_key")]
    pub private_key: Vec<u8>,
    #[napi(js_name = "keygen_outputs")]
    pub keygen_outputs: Vec<NapiKeygenOutput>,
    #[napi(js_name = "public_key")]
    pub public_key: Vec<u8>,
}

fn keygen_centralized_inner() -> std::result::Result<NapiCentralizedKeygenOutput, String> {
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

        keygen_outputs.push(NapiKeygenOutput {
            key_package: key_package_bytes,
            public_key_package: pubkey_package_bytes.clone(),
            identifier: identifier_bytes,
        });
    }

    Ok(NapiCentralizedKeygenOutput {
        private_key: vec![0u8; 32],
        keygen_outputs,
        public_key: public_key_bytes,
    })
}

fn keygen_import_inner(secret: [u8; 32]) -> std::result::Result<NapiCentralizedKeygenOutput, String> {
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

        keygen_outputs.push(NapiKeygenOutput {
            key_package: key_package_bytes,
            public_key_package: pubkey_package_bytes.clone(),
            identifier: identifier_bytes,
        });
    }

    Ok(NapiCentralizedKeygenOutput {
        private_key: secret.to_vec(),
        keygen_outputs,
        public_key: public_key_bytes,
    })
}

/// Generate a 2-of-2 threshold Ed25519 key using centralized key generation.
#[napi]
pub fn napi_keygen_centralized_ed25519() -> Result<NapiCentralizedKeygenOutput> {
    keygen_centralized_inner().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen_centralized error: {:?}", e),
        )
    })
}

/// Import an existing Ed25519 secret key and split it into threshold shares.
#[napi]
pub fn napi_keygen_import_ed25519(secret_key: Vec<u8>) -> Result<NapiCentralizedKeygenOutput> {
    if secret_key.len() != 32 {
        return Err(napi::Error::new(
            napi::Status::InvalidArg,
            "secret_key must be exactly 32 bytes",
        ));
    }

    let mut secret_arr = [0u8; 32];
    secret_arr.copy_from_slice(&secret_key);

    keygen_import_inner(secret_arr).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen_import error: {:?}", e),
        )
    })
}
