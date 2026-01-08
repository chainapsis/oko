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

fn keygen_import_inner(
    secret: [u8; 32],
) -> std::result::Result<NapiCentralizedKeygenOutput, String> {
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

/// Extract signing_share and verifying_share from a serialized key_package.
#[napi(object)]
pub struct NapiKeyPackageShares {
    #[napi(js_name = "signing_share")]
    pub signing_share: Vec<u8>,
    #[napi(js_name = "verifying_share")]
    pub verifying_share: Vec<u8>,
}

/// Extract signing_share and verifying_share from a serialized Ed25519 key_package.
#[napi]
pub fn napi_extract_key_package_shares_ed25519(
    key_package_bytes: Vec<u8>,
) -> Result<NapiKeyPackageShares> {
    let key_package = KeyPackage::deserialize(&key_package_bytes).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to deserialize key_package: {:?}", e),
        )
    })?;

    let signing_share_bytes = key_package.signing_share().serialize();
    let verifying_share_bytes = key_package
        .verifying_share()
        .serialize()
        .map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Failed to serialize verifying_share: {:?}", e),
            )
        })?
        .to_vec();

    Ok(NapiKeyPackageShares {
        signing_share: signing_share_bytes.to_vec(),
        verifying_share: verifying_share_bytes,
    })
}

/// Reconstruct a key_package from signing_share, verifying_share, identifier, and verifying_key.
#[napi]
pub fn napi_reconstruct_key_package_ed25519(
    signing_share: Vec<u8>,
    verifying_share: Vec<u8>,
    identifier: Vec<u8>,
    verifying_key: Vec<u8>,
    min_signers: u16,
) -> Result<Vec<u8>> {
    use frost::keys::{SigningShare, VerifyingShare};
    use frost::Identifier;
    use frost::VerifyingKey;

    let identifier = Identifier::deserialize(&identifier).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to deserialize identifier: {:?}", e),
        )
    })?;

    let signing_share = SigningShare::deserialize(&signing_share).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to deserialize signing_share: {:?}", e),
        )
    })?;

    let verifying_share = VerifyingShare::deserialize(&verifying_share).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to deserialize verifying_share: {:?}", e),
        )
    })?;

    let verifying_key = VerifyingKey::deserialize(&verifying_key).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to deserialize verifying_key: {:?}", e),
        )
    })?;

    let key_package = KeyPackage::new(
        identifier,
        signing_share,
        verifying_share,
        verifying_key,
        min_signers,
    );

    let key_package_bytes = key_package.serialize().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to serialize key_package: {:?}", e),
        )
    })?;

    Ok(key_package_bytes)
}
