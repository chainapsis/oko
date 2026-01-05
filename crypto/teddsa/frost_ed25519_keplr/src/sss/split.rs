use alloc::string::String;
use alloc::vec::Vec;

use frost_core::SigningKey;
use rand_core::{CryptoRng, RngCore};

use crate::keys::{split, IdentifierList, KeyPackage, PublicKeyPackage};
use crate::{Ed25519Sha512, Identifier};

/// Output of the split operation using VSS (Verifiable Secret Sharing).
pub struct SplitOutput {
    /// Key packages for each participant
    pub key_packages: Vec<KeyPackage>,
    /// The public key package shared among all participants
    pub public_key_package: PublicKeyPackage,
}

/// Splits an Ed25519 secret into shares using FROST's VSS (Verifiable Secret Sharing).
///
/// This produces KeyPackage objects that can be used directly for FROST signing,
/// along with a PublicKeyPackage that contains the group public key.
pub fn sss_split_ed25519<R: RngCore + CryptoRng>(
    secret: [u8; 32],
    identifiers: Vec<[u8; 32]>,
    min_signers: u16,
    rng: &mut R,
) -> Result<SplitOutput, String> {
    let signing_key = SigningKey::<Ed25519Sha512>::deserialize(secret.as_slice())
        .map_err(|e| alloc::format!("Failed to deserialize signing key: {}", e))?;

    let max_signers = identifiers.len() as u16;

    let identifier_list: Vec<Identifier> = identifiers
        .iter()
        .map(|x| {
            Identifier::deserialize(x.as_slice())
                .map_err(|e| alloc::format!("Failed to deserialize identifier: {}", e))
        })
        .collect::<Result<Vec<_>, _>>()?;

    let (shares, public_key_package) = split(
        &signing_key,
        max_signers,
        min_signers,
        IdentifierList::Custom(&identifier_list),
        rng,
    )
    .map_err(|e| alloc::format!("Failed to split: {}", e))?;

    let key_packages: Vec<KeyPackage> = shares
        .into_iter()
        .map(|(_, secret_share)| {
            KeyPackage::try_from(secret_share)
                .map_err(|e| alloc::format!("Failed to convert to KeyPackage: {}", e))
        })
        .collect::<Result<Vec<_>, _>>()?;

    Ok(SplitOutput {
        key_packages,
        public_key_package,
    })
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::*;
    use alloc::vec;
    use rand_core::OsRng;
    use std::eprintln;

    #[test]
    fn test_sss_split_ed25519() {
        let mut secret = [0u8; 32];
        secret[0] = 1; // little-endian: 1
        let mut identifiers = vec![[0u8; 32]; 3];
        identifiers[0][0] = 1;
        identifiers[1][0] = 2;
        identifiers[2][0] = 3;
        let min_signers = 2;

        let mut rng = OsRng;
        let output =
            sss_split_ed25519(secret, identifiers, min_signers, &mut rng).expect("Failed to split");

        assert_eq!(output.key_packages.len(), 3);

        for (i, key_package) in output.key_packages.iter().enumerate() {
            eprintln!(
                "key_package[{}] identifier: {:?}",
                i,
                key_package.identifier()
            );
            eprintln!(
                "key_package[{}] signing_share: {:?}",
                i,
                key_package.signing_share()
            );
        }

        eprintln!(
            "public_key_package verifying_key: {:?}",
            output.public_key_package.verifying_key()
        );
    }

    #[test]
    fn test_secret_key_out_of_range() {
        // Value exceeds Ed25519 scalar field order (~2^252), should fail
        let secret = [255u8; 32];
        let result = SigningKey::<Ed25519Sha512>::deserialize(secret.as_slice());
        assert!(
            result.is_err(),
            "Expected MalformedScalar error for out-of-range value"
        );
    }
}
