use alloc::vec;
use alloc::vec::Vec;
use rand_core::OsRng;

use crate::sss::{sss_combine_ed25519, sss_split_ed25519};

/// Test split and combine using VSS-based KeyPackages.
#[test]
fn test_sss_split_and_combine_ed25519() {
    let mut secret = [0u8; 32];
    secret[0] = 1; // little-endian: 1

    let mut id_1 = [0u8; 32];
    id_1[0] = 1;
    let mut id_2 = [0u8; 32];
    id_2[0] = 2;
    let mut id_3 = [0u8; 32];
    id_3[0] = 3;

    let mut rng = OsRng;

    let identifiers = vec![id_1, id_2, id_3];
    let split_output = sss_split_ed25519(secret, identifiers, 2, &mut rng).unwrap();

    assert_eq!(split_output.key_packages.len(), 3);

    // Combine using first 2 key packages (threshold = 2)
    let key_packages_for_combine: Vec<_> = split_output.key_packages.iter().take(2).cloned().collect();
    let combined_secret = sss_combine_ed25519(&key_packages_for_combine).unwrap();
    assert_eq!(combined_secret, secret);
}

/// Test that combining with different threshold-many subsets gives the same result.
#[test]
fn test_sss_combine_different_subsets() {
    let mut secret = [0u8; 32];
    secret[0] = 42;

    let mut id_1 = [0u8; 32];
    id_1[0] = 1;
    let mut id_2 = [0u8; 32];
    id_2[0] = 2;
    let mut id_3 = [0u8; 32];
    id_3[0] = 3;

    let mut rng = OsRng;

    let identifiers = vec![id_1, id_2, id_3];
    let split_output = sss_split_ed25519(secret, identifiers, 2, &mut rng).unwrap();

    // Combine using packages 0 and 1
    let subset_01: Vec<_> = vec![
        split_output.key_packages[0].clone(),
        split_output.key_packages[1].clone(),
    ];
    let combined_01 = sss_combine_ed25519(&subset_01).unwrap();
    assert_eq!(combined_01, secret);

    // Combine using packages 0 and 2
    let subset_02: Vec<_> = vec![
        split_output.key_packages[0].clone(),
        split_output.key_packages[2].clone(),
    ];
    let combined_02 = sss_combine_ed25519(&subset_02).unwrap();
    assert_eq!(combined_02, secret);

    // Combine using packages 1 and 2
    let subset_12: Vec<_> = vec![
        split_output.key_packages[1].clone(),
        split_output.key_packages[2].clone(),
    ];
    let combined_12 = sss_combine_ed25519(&subset_12).unwrap();
    assert_eq!(combined_12, secret);
}

/// Test 2-of-2 threshold scheme (used by the wallet).
#[test]
fn test_sss_2_of_2_threshold() {
    let mut secret = [0u8; 32];
    secret[0] = 123;

    let mut id_1 = [0u8; 32];
    id_1[0] = 1;
    let mut id_2 = [0u8; 32];
    id_2[0] = 2;

    let mut rng = OsRng;

    let identifiers = vec![id_1, id_2];
    let split_output = sss_split_ed25519(secret, identifiers, 2, &mut rng).unwrap();

    assert_eq!(split_output.key_packages.len(), 2);

    // Both packages required to reconstruct
    let combined_secret = sss_combine_ed25519(&split_output.key_packages).unwrap();
    assert_eq!(combined_secret, secret);
}
