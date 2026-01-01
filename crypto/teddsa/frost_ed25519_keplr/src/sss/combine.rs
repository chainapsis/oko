use alloc::string::String;

use crate::keys::{reconstruct, KeyPackage};

/// Combines Ed25519 key packages to recover the original secret using FROST's reconstruct.
///
/// This uses Lagrange interpolation internally to recover the original signing key
/// from threshold-many KeyPackages.
///
/// NOTE: The caller must provide at least `min_signers` key packages.
/// If fewer are provided, a different (incorrect) key will be returned.
pub fn sss_combine_ed25519(key_packages: &[KeyPackage]) -> Result<[u8; 32], String> {
    let signing_key =
        reconstruct(key_packages).map_err(|e| alloc::format!("Failed to reconstruct: {}", e))?;

    let serialized = signing_key.serialize();
    let result: [u8; 32] = serialized
        .try_into()
        .map_err(|_| alloc::format!("Invalid signing key length"))?;

    Ok(result)
}
