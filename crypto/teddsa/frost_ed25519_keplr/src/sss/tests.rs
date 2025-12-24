use alloc::vec;
use rand_core::OsRng;

use crate::sss::{expand_shares, reshare, sss_combine_ed25519, sss_split_ed25519};

#[test]
fn test_sss_combine_ed25519() {
    let mut secret = [0; 32];
    secret[0] = 1;

    let mut point_1 = [0; 32];
    point_1[0] = 1;
    let mut point_2 = [0; 32];
    point_2[0] = 2;
    let mut point_3 = [0; 32];
    point_3[0] = 3;

    let mut rng = OsRng;

    let point_xs = vec![point_1, point_2, point_3];
    let split_points = sss_split_ed25519(secret, point_xs, 2, &mut rng).unwrap();
    let combined_secret = sss_combine_ed25519(split_points, 2).unwrap();
    assert_eq!(combined_secret, secret);
}

#[test]
fn test_reshare() {
    let mut secret = [0; 32];
    secret[31] = 1;

    let mut point_1 = [0; 32];
    point_1[31] = 1;
    let mut point_2 = [0; 32];
    point_2[31] = 2;
    let mut point_3 = [0; 32];
    point_3[31] = 3;

    let mut rng = OsRng;

    let point_xs = vec![point_1, point_2, point_3];
    let split_points = sss_split_ed25519(secret, point_xs, 2, &mut rng).unwrap();

    // Reshare to new nodes
    let mut new_point_1 = [0; 32];
    new_point_1[31] = 4;
    let mut new_point_2 = [0; 32];
    new_point_2[31] = 5;
    let mut new_point_3 = [0; 32];
    new_point_3[31] = 6;

    let new_ks_node_hashes = vec![new_point_1, new_point_2, new_point_3];
    let reshare_result = reshare(split_points, new_ks_node_hashes, 2, &mut rng).unwrap();

    // Verify reshared secret matches original
    assert_eq!(reshare_result.secret, secret);
    assert_eq!(reshare_result.t, 2);
    assert_eq!(reshare_result.reshared_points.len(), 3);

    // Verify we can combine the reshared points to recover secret
    let combined_secret = sss_combine_ed25519(reshare_result.reshared_points, 2).unwrap();
    assert_eq!(combined_secret, secret);
}

#[test]
fn test_expand_shares() {
    let mut secret = [0; 32];
    secret[0] = 1;

    let mut point_1 = [0; 32];
    point_1[0] = 1;
    let mut point_2 = [0; 32];
    point_2[0] = 2;
    let mut point_3 = [0; 32];
    point_3[0] = 3;

    let mut rng = OsRng;

    let point_xs = vec![point_1, point_2, point_3];
    let split_points = sss_split_ed25519(secret, point_xs, 2, &mut rng).unwrap();

    // Expand with additional nodes
    let mut new_point_1 = [0; 32];
    new_point_1[0] = 4;
    let mut new_point_2 = [0; 32];
    new_point_2[0] = 5;

    let additional_hashes = vec![new_point_1, new_point_2];
    let expand_result = expand_shares(split_points.clone(), additional_hashes, 2).unwrap();

    // Verify secret is recovered correctly
    assert_eq!(expand_result.secret, secret);
    assert_eq!(expand_result.t, 2);
    // Original 3 points + 2 new points = 5
    assert_eq!(expand_result.reshared_points.len(), 5);

    // Verify we can combine any 2 of the expanded points to recover secret
    // Use new points only
    let new_points_only = expand_result.reshared_points[3..].to_vec();
    let combined_from_new = sss_combine_ed25519(new_points_only, 2).unwrap();
    assert_eq!(combined_from_new, secret);

    // Use mix of old and new
    let mixed_points = vec![
        expand_result.reshared_points[0].clone(),
        expand_result.reshared_points[4].clone(),
    ];
    let combined_from_mixed = sss_combine_ed25519(mixed_points, 2).unwrap();
    assert_eq!(combined_from_mixed, secret);
}

#[test]
fn test_expand_shares_duplicate_error() {
    let mut secret = [0; 32];
    secret[31] = 1;

    let mut point_1 = [0; 32];
    point_1[31] = 1;
    let mut point_2 = [0; 32];
    point_2[31] = 2;
    let mut point_3 = [0; 32];
    point_3[31] = 3;

    let mut rng = OsRng;

    let point_xs = vec![point_1, point_2, point_3];
    let split_points = sss_split_ed25519(secret, point_xs, 2, &mut rng).unwrap();

    // Try to expand with a hash that's already in split_points
    let duplicate_hash = split_points[0].x;
    let additional_hashes = vec![duplicate_hash];
    let result = expand_shares(split_points, additional_hashes, 2);

    assert!(result.is_err());
    assert_eq!(
        result.err().unwrap(),
        "New hash is already included in split points"
    );
}

#[test]
fn test_expand_shares_preserves_original_points_order() {
    let mut secret = [0; 32];
    secret[0] = 1;

    let mut point_1 = [0; 32];
    point_1[0] = 1;
    let mut point_2 = [0; 32];
    point_2[0] = 2;
    let mut point_3 = [0; 32];
    point_3[0] = 3;

    let mut rng = OsRng;

    let point_xs = vec![point_1, point_2, point_3];
    let split_points = sss_split_ed25519(secret, point_xs, 2, &mut rng).unwrap();

    // Expand with additional nodes
    let mut new_point_1 = [0; 32];
    new_point_1[0] = 4;
    let mut new_point_2 = [0; 32];
    new_point_2[0] = 5;

    let additional_hashes = vec![new_point_1, new_point_2];
    let expand_result = expand_shares(split_points.clone(), additional_hashes, 2).unwrap();

    // Verify original points are preserved in order at the beginning
    for (i, original_point) in split_points.iter().enumerate() {
        assert_eq!(
            expand_result.reshared_points[i].x, original_point.x,
            "Original point {} x coordinate mismatch",
            i
        );
        assert_eq!(
            expand_result.reshared_points[i].y, original_point.y,
            "Original point {} y coordinate mismatch",
            i
        );
    }

    // Verify the structure: first 3 are original, last 2 are new
    assert_eq!(expand_result.reshared_points.len(), 5);
    assert_eq!(expand_result.reshared_points[0], split_points[0]);
    assert_eq!(expand_result.reshared_points[1], split_points[1]);
    assert_eq!(expand_result.reshared_points[2], split_points[2]);

    // Verify new points have unique x values different from all other points
    let new_points = &expand_result.reshared_points[3..];
    for (i, new_point) in new_points.iter().enumerate() {
        // Check against original points
        for (j, original_point) in split_points.iter().enumerate() {
            assert_ne!(
                new_point.x, original_point.x,
                "New point {} has same x as original point {}",
                i, j
            );
        }
        // Check against other new points
        for (j, other_new_point) in new_points.iter().enumerate() {
            if i != j {
                assert_ne!(
                    new_point.x, other_new_point.x,
                    "New point {} has same x as new point {}",
                    i, j
                );
            }
        }
    }
}
