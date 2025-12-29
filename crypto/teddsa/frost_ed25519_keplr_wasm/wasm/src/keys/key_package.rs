use frost_ed25519_keplr::keys::KeyPackage;
use serde::{Deserialize, Serialize};

use super::PublicKeyPackageRaw;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeygenOutputRaw {
    pub identifier: [u8; 32],
    pub key_package: KeyPackageRaw,
    pub public_key_package: PublicKeyPackageRaw,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralizedKeygenOutputRaw {
    pub private_key: [u8; 32],
    pub public_key: [u8; 32],
    pub keygen_outputs: Vec<KeygenOutputRaw>,
}

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
}
