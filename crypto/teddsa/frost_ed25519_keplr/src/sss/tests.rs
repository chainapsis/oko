use alloc::vec;
use alloc::vec::Vec;
use rand_core::OsRng;

use crate::sss::{reshare, sss_combine_ed25519, sss_split_ed25519};

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
    let key_packages_for_combine: Vec<_> =
        split_output.key_packages.iter().take(2).cloned().collect();
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

/// Test reshare: split to 3 nodes, then reshare to 3 different nodes.
#[test]
fn test_reshare_to_new_nodes() {
    let mut secret = [0u8; 32];
    secret[0] = 77;

    // Original identifiers
    let mut id_1 = [0u8; 32];
    id_1[0] = 1;
    let mut id_2 = [0u8; 32];
    id_2[0] = 2;
    let mut id_3 = [0u8; 32];
    id_3[0] = 3;

    let mut rng = OsRng;

    // Initial split
    let identifiers = vec![id_1, id_2, id_3];
    let split_output = sss_split_ed25519(secret, identifiers, 2, &mut rng).unwrap();

    // New identifiers for reshare
    let mut new_id_1 = [0u8; 32];
    new_id_1[0] = 4;
    let mut new_id_2 = [0u8; 32];
    new_id_2[0] = 5;
    let mut new_id_3 = [0u8; 32];
    new_id_3[0] = 6;

    let new_identifiers = vec![new_id_1, new_id_2, new_id_3];

    // Reshare using first 2 key packages (threshold)
    let key_packages_for_reshare: Vec<_> =
        split_output.key_packages.iter().take(2).cloned().collect();
    let reshare_output = reshare(&key_packages_for_reshare, new_identifiers, 2, &mut rng).unwrap();

    // Verify secret is preserved
    assert_eq!(reshare_output.secret, secret);
    assert_eq!(reshare_output.key_packages.len(), 3);

    // Verify we can combine the reshared key packages to recover the secret
    let combined_from_reshared = sss_combine_ed25519(&reshare_output.key_packages).unwrap();
    assert_eq!(combined_from_reshared, secret);
}

/// Test reshare with same threshold.
#[test]
fn test_reshare_2_of_2_to_2_of_2() {
    let mut secret = [0u8; 32];
    secret[0] = 99;

    let mut id_1 = [0u8; 32];
    id_1[0] = 1;
    let mut id_2 = [0u8; 32];
    id_2[0] = 2;

    let mut rng = OsRng;

    // Initial 2-of-2 split
    let identifiers = vec![id_1, id_2];
    let split_output = sss_split_ed25519(secret, identifiers, 2, &mut rng).unwrap();

    // New identifiers for reshare
    let mut new_id_1 = [0u8; 32];
    new_id_1[0] = 10;
    let mut new_id_2 = [0u8; 32];
    new_id_2[0] = 20;

    let new_identifiers = vec![new_id_1, new_id_2];

    // Reshare (need both key packages for 2-of-2)
    let reshare_output = reshare(&split_output.key_packages, new_identifiers, 2, &mut rng).unwrap();

    assert_eq!(reshare_output.secret, secret);
    assert_eq!(reshare_output.key_packages.len(), 2);

    // Combine reshared packages
    let combined = sss_combine_ed25519(&reshare_output.key_packages).unwrap();
    assert_eq!(combined, secret);
}
