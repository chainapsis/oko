use alloc::string::{String, ToString};
use alloc::vec::Vec;

use rand_core::{CryptoRng, RngCore};

use crate::keys::{KeyPackage, PublicKeyPackage};
use crate::sss::{sss_combine_ed25519, sss_split_ed25519, SplitOutput};

/// Result of a reshare operation using VSS-based KeyPackages.
pub struct ReshareOutput {
    /// Key packages for each new participant
    pub key_packages: Vec<KeyPackage>,
    /// The public key package shared among all participants
    pub public_key_package: PublicKeyPackage,
    /// The recovered secret (for verification purposes)
    pub secret: [u8; 32],
}

/// Reshares existing key packages to a new set of nodes with a fresh polynomial.
///
/// This function recovers the secret from existing KeyPackages and creates new
/// KeyPackages for a potentially different set of nodes using a new random polynomial.
///
/// # Arguments
/// * `key_packages` - Existing key packages (at least min_signers required)
/// * `new_identifiers` - Identifiers for the new set of nodes
/// * `new_min_signers` - New threshold value
/// * `rng` - Random number generator
pub fn reshare<R: RngCore + CryptoRng>(
    key_packages: &[KeyPackage],
    new_identifiers: Vec<[u8; 32]>,
    new_min_signers: u16,
    rng: &mut R,
) -> Result<ReshareOutput, String> {
    if key_packages.is_empty() {
        return Err("No key packages provided".to_string());
    }

    if new_identifiers.len() < new_min_signers as usize {
        return Err("New identifiers must be at least new_min_signers".to_string());
    }

    let secret = sss_combine_ed25519(key_packages)?;

    let split_output: SplitOutput =
        sss_split_ed25519(secret, new_identifiers, new_min_signers, rng)?;

    Ok(ReshareOutput {
        key_packages: split_output.key_packages,
        public_key_package: split_output.public_key_package,
        secret,
    })
}
