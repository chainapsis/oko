use alloc::vec;
use rand_core::OsRng;

use crate::sss::{sss_combine_ed25519, sss_split_ed25519};

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
