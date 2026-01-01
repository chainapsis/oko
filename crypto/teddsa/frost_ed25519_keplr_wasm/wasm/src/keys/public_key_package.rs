use frost_ed25519_keplr::keys::{PublicKeyPackage, VerifyingShare};
use frost_ed25519_keplr::{Identifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap};

use super::IdentifierHex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicKeyPackageRaw {
    pub verifying_shares: HashMap<IdentifierHex, [u8; 32]>,
    pub verifying_key: [u8; 32],
}

impl PublicKeyPackageRaw {
    pub fn from_public_key_package(pkg: &PublicKeyPackage) -> Result<Self, String> {
        let mut verifying_shares = HashMap::new();

        for (identifier, verifying_share) in pkg.verifying_shares() {
            let id_hex = hex::encode(identifier.serialize());
            let share_bytes: [u8; 32] = verifying_share
                .serialize()
                .map_err(|e| e.to_string())?
                .try_into()
                .map_err(|_| "Invalid verifying share length")?;
            verifying_shares.insert(id_hex, share_bytes);
        }

        let verifying_key: [u8; 32] = pkg
            .verifying_key()
            .serialize()
            .map_err(|e| e.to_string())?
            .try_into()
            .map_err(|_| "Invalid verifying key length")?;

        Ok(Self {
            verifying_shares,
            verifying_key,
        })
    }

    pub fn to_public_key_package(&self) -> Result<PublicKeyPackage, String> {
        let mut verifying_shares: BTreeMap<Identifier, VerifyingShare> = BTreeMap::new();

        for (id_hex, share_bytes) in &self.verifying_shares {
            let id_bytes = hex::decode(id_hex).map_err(|e| e.to_string())?;
            let identifier = Identifier::deserialize(&id_bytes).map_err(|e| e.to_string())?;
            let verifying_share =
                VerifyingShare::deserialize(share_bytes).map_err(|e| e.to_string())?;
            verifying_shares.insert(identifier, verifying_share);
        }

        let verifying_key =
            VerifyingKey::deserialize(&self.verifying_key).map_err(|e| e.to_string())?;

        Ok(PublicKeyPackage::new(verifying_shares, verifying_key))
    }
}
