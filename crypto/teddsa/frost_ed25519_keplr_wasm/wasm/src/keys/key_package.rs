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
