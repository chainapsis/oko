use alloc::collections::BTreeSet;
use alloc::string::String;
use alloc::vec::Vec;

use frost_core::{Field, Group};

use crate::keys::{KeyPackage, PublicKeyPackage, SigningShare, VerifyingShare};
use crate::sss::compute_lagrange_coefficient;
use crate::{Ed25519Sha512, Identifier};

/// Output of the extend_shares operation.
#[derive(Debug)]
pub struct ExtendOutput {
    /// New key packages for the additional participants
    pub new_key_packages: Vec<KeyPackage>,
    /// The public key package (same as original, with new verifying shares added)
    pub public_key_package: PublicKeyPackage,
}

/// Extends existing key packages to include new participants without changing the polynomial.
///
/// Unlike reshare, this preserves the original polynomial and existing shares remain valid.
/// New shares are computed via Lagrange interpolation on the existing shares.
///
/// # Arguments
/// * `key_packages` - Existing key packages (at least min_signers required)
/// * `new_identifiers` - Identifiers for the new participants to add
/// * `public_key_package` - The existing public key package
///
/// # Returns
/// New KeyPackages for the additional identifiers. Existing shares remain valid.
pub fn extend_shares_ed25519(
    key_packages: &[KeyPackage],
    new_identifiers: Vec<[u8; 32]>,
    public_key_package: &PublicKeyPackage,
) -> Result<ExtendOutput, String> {
    if key_packages.is_empty() {
        return Err("No key packages provided".into());
    }

    if new_identifiers.is_empty() {
        return Err("No new identifiers provided".into());
    }

    // Get existing identifiers
    let existing_ids: BTreeSet<Identifier> =
        key_packages.iter().map(|kp| *kp.identifier()).collect();

    // Parse new identifiers
    let new_ids: Vec<Identifier> = new_identifiers
        .iter()
        .map(|id_bytes| {
            Identifier::deserialize(id_bytes.as_slice())
                .map_err(|e| alloc::format!("Failed to deserialize new identifier: {}", e))
        })
        .collect::<Result<Vec<_>, _>>()?;

    // Check for duplicates with existing identifiers
    for new_id in &new_ids {
        if existing_ids.contains(new_id) {
            return Err("New identifier already exists in key packages".into());
        }
    }

    // Get min_signers from existing key package
    let min_signers = *key_packages[0].min_signers();

    // Get the group verifying key
    let verifying_key = public_key_package.verifying_key();

    // Compute new shares using Lagrange interpolation
    // For each new identifier x*, compute f(x*) = sum(lambda_i * f(x_i))
    // where lambda_i is the Lagrange coefficient for x_i evaluated at x*
    let mut new_key_packages = Vec::with_capacity(new_ids.len());
    let mut new_verifying_shares = public_key_package.verifying_shares().clone();

    for new_id in new_ids {
        // Compute f(new_id) by interpolating existing shares
        let mut new_signing_share_scalar =
            <<Ed25519Sha512 as frost_core::Ciphersuite>::Group as Group>::Field::zero();

        for kp in key_packages {
            let coeff = compute_lagrange_coefficient::<Ed25519Sha512>(
                &existing_ids,
                Some(new_id),
                *kp.identifier(),
            )
            .map_err(|e| alloc::format!("Failed to compute Lagrange coefficient: {:?}", e))?;

            let share_scalar = kp.signing_share().to_scalar();
            new_signing_share_scalar = new_signing_share_scalar + coeff * share_scalar;
        }

        // Create SigningShare from the computed scalar
        let new_signing_share = SigningShare::new(new_signing_share_scalar);

        // Compute verifying share: g^{f(new_id)}
        let new_verifying_share = VerifyingShare::from(new_signing_share);

        // Add to verifying shares map
        new_verifying_shares.insert(new_id, new_verifying_share);

        // Create KeyPackage for new participant
        let new_key_package = KeyPackage::new(
            new_id,
            new_signing_share,
            new_verifying_share,
            *verifying_key,
            min_signers,
        );

        new_key_packages.push(new_key_package);
    }

    // Create updated public key package with all verifying shares
    let updated_public_key_package = PublicKeyPackage::new(new_verifying_shares, *verifying_key);

    Ok(ExtendOutput {
        new_key_packages,
        public_key_package: updated_public_key_package,
    })
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::*;
    use crate::sss::{sss_combine_ed25519, sss_split_ed25519};
    use alloc::vec;
    use rand_core::OsRng;
    use std::eprintln;

    #[test]
    fn test_extend_shares_basic() {
        let mut rng = OsRng;

        // Create initial 2-of-3 sharing
        let mut secret = [0u8; 32];
        secret[0] = 42;

        let mut initial_ids = vec![[0u8; 32]; 3];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;
        initial_ids[2][0] = 3;

        let split_output =
            sss_split_ed25519(secret, initial_ids, 2, &mut rng).expect("Failed to split");

        // Extend to add a 4th participant
        let mut new_ids = vec![[0u8; 32]; 1];
        new_ids[0][0] = 4;

        let extend_output = extend_shares_ed25519(
            &split_output.key_packages,
            new_ids,
            &split_output.public_key_package,
        )
        .expect("Failed to extend shares");

        assert_eq!(extend_output.new_key_packages.len(), 1);

        // Verify the new share can be combined with original shares to recover secret
        let combined_packages = vec![
            split_output.key_packages[0].clone(),
            extend_output.new_key_packages[0].clone(),
        ];

        let recovered = sss_combine_ed25519(&combined_packages).expect("Failed to combine");
        assert_eq!(recovered, secret);

        eprintln!("Successfully extended shares and verified recovery");
    }

    #[test]
    fn test_extend_shares_multiple() {
        let mut rng = OsRng;

        // Create initial 2-of-2 sharing
        let mut secret = [0u8; 32];
        secret[0] = 100;

        let mut initial_ids = vec![[0u8; 32]; 2];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;

        let split_output =
            sss_split_ed25519(secret, initial_ids, 2, &mut rng).expect("Failed to split");

        // Extend to add 2 more participants
        let mut new_ids = vec![[0u8; 32]; 2];
        new_ids[0][0] = 3;
        new_ids[1][0] = 4;

        let extend_output = extend_shares_ed25519(
            &split_output.key_packages,
            new_ids,
            &split_output.public_key_package,
        )
        .expect("Failed to extend shares");

        assert_eq!(extend_output.new_key_packages.len(), 2);

        // Verify new shares work together
        let combined_packages = vec![
            extend_output.new_key_packages[0].clone(),
            extend_output.new_key_packages[1].clone(),
        ];

        let recovered = sss_combine_ed25519(&combined_packages).expect("Failed to combine");
        assert_eq!(recovered, secret);

        eprintln!("Successfully extended with multiple new shares");
    }

    #[test]
    fn test_extend_shares_duplicate_id_error() {
        let mut rng = OsRng;

        let mut secret = [0u8; 32];
        secret[0] = 1;

        let mut initial_ids = vec![[0u8; 32]; 2];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;

        let split_output =
            sss_split_ed25519(secret, initial_ids.clone(), 2, &mut rng).expect("Failed to split");

        // Try to extend with an existing identifier
        let result = extend_shares_ed25519(
            &split_output.key_packages,
            vec![initial_ids[0]], // duplicate!
            &split_output.public_key_package,
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }

    /// Test that original shares remain unchanged after extend
    #[test]
    fn test_extend_shares_original_unchanged() {
        let mut rng = OsRng;

        let mut secret = [0u8; 32];
        secret[0] = 77;

        let mut initial_ids = vec![[0u8; 32]; 3];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;
        initial_ids[2][0] = 3;

        let split_output =
            sss_split_ed25519(secret, initial_ids, 2, &mut rng).expect("Failed to split");

        // Store original signing shares for comparison
        let original_shares: Vec<_> = split_output
            .key_packages
            .iter()
            .map(|kp| (*kp.identifier(), kp.signing_share().to_scalar()))
            .collect();

        // Extend to add new participants
        let mut new_ids = vec![[0u8; 32]; 2];
        new_ids[0][0] = 4;
        new_ids[1][0] = 5;

        let _extend_output = extend_shares_ed25519(
            &split_output.key_packages,
            new_ids,
            &split_output.public_key_package,
        )
        .expect("Failed to extend shares");

        // Verify original key packages are unchanged
        for (i, kp) in split_output.key_packages.iter().enumerate() {
            let (orig_id, orig_scalar) = &original_shares[i];
            assert_eq!(
                kp.identifier(),
                orig_id,
                "Identifier changed at index {}",
                i
            );
            assert_eq!(
                kp.signing_share().to_scalar(),
                *orig_scalar,
                "Signing share changed at index {}",
                i
            );
        }

        // Original shares should still combine to the same secret
        let recovered = sss_combine_ed25519(&split_output.key_packages[0..2])
            .expect("Failed to combine original shares");
        assert_eq!(
            recovered, secret,
            "Original shares no longer recover secret"
        );

        eprintln!("Original shares remain unchanged after extend");
    }

    /// Test that all shares (original + new) lie on the same polynomial
    /// by verifying any combination of min_signers shares recovers the same secret
    #[test]
    fn test_extend_shares_same_polynomial() {
        let mut rng = OsRng;

        let mut secret = [0u8; 32];
        secret[0] = 123;
        secret[1] = 45;

        // Create 2-of-3 sharing
        let mut initial_ids = vec![[0u8; 32]; 3];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;
        initial_ids[2][0] = 3;

        let split_output =
            sss_split_ed25519(secret, initial_ids, 2, &mut rng).expect("Failed to split");

        // Extend to add 2 new participants (total 5 shares, still 2-of-5)
        let mut new_ids = vec![[0u8; 32]; 2];
        new_ids[0][0] = 4;
        new_ids[1][0] = 5;

        let extend_output = extend_shares_ed25519(
            &split_output.key_packages,
            new_ids,
            &split_output.public_key_package,
        )
        .expect("Failed to extend shares");

        // Collect all shares (original + new)
        let all_packages: Vec<KeyPackage> = split_output
            .key_packages
            .iter()
            .chain(extend_output.new_key_packages.iter())
            .cloned()
            .collect();

        assert_eq!(all_packages.len(), 5);

        // Test all possible pairs of shares (C(5,2) = 10 combinations)
        let combinations = [
            (0, 1), // orig + orig
            (0, 2),
            (1, 2),
            (0, 3), // orig + new
            (0, 4),
            (1, 3),
            (1, 4),
            (2, 3),
            (2, 4),
            (3, 4), // new + new
        ];

        for (i, j) in combinations {
            let pair = vec![all_packages[i].clone(), all_packages[j].clone()];
            let recovered = sss_combine_ed25519(&pair).expect(&std::format!(
                "Failed to combine shares {} and {}",
                i,
                j
            ));
            assert_eq!(
                recovered, secret,
                "Shares {} and {} don't recover the same secret",
                i, j
            );
        }

        eprintln!("All 10 pairs of shares recover the same secret - same polynomial confirmed");
    }

    /// Test verifying shares in public key package are consistent
    #[test]
    fn test_extend_shares_verifying_shares_consistent() {
        use frost_core::Group;

        let mut rng = OsRng;

        let mut secret = [0u8; 32];
        secret[0] = 99;

        let mut initial_ids = vec![[0u8; 32]; 2];
        initial_ids[0][0] = 1;
        initial_ids[1][0] = 2;

        let split_output =
            sss_split_ed25519(secret, initial_ids, 2, &mut rng).expect("Failed to split");

        let mut new_ids = vec![[0u8; 32]; 1];
        new_ids[0][0] = 3;

        let extend_output = extend_shares_ed25519(
            &split_output.key_packages,
            new_ids,
            &split_output.public_key_package,
        )
        .expect("Failed to extend shares");

        // Verify each new key package's verifying share matches g^signing_share
        for new_kp in &extend_output.new_key_packages {
            let signing_scalar = new_kp.signing_share().to_scalar();
            let expected_verifying = <crate::Ed25519Group as Group>::generator() * signing_scalar;

            let actual_verifying = new_kp.verifying_share().to_element();

            assert_eq!(
                expected_verifying,
                actual_verifying,
                "Verifying share doesn't match g^signing_share for {:?}",
                new_kp.identifier()
            );
        }

        // Verify the public key package contains all verifying shares
        let pub_pkg = &extend_output.public_key_package;
        assert_eq!(
            pub_pkg.verifying_shares().len(),
            3,
            "Public key package should have 3 verifying shares"
        );

        eprintln!("Verifying shares are consistent with signing shares");
    }
}
