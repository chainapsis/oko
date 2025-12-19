use alloc::string::{String, ToString};
use alloc::vec::Vec;

use crate::point::Point256;
use crate::sss::interpolate_ed25519;

/// Combines Ed25519 shares to recover the original secret.
pub fn sss_combine_ed25519(split_points: Vec<Point256>, t: u32) -> Result<[u8; 32], String> {
    if split_points.len() < t as usize {
        return Err("Not enough keyshare points to combine".to_string());
    }

    let truncated_split_points = split_points.iter().take(t as usize).collect::<Vec<_>>();

    let combined_secret = interpolate_ed25519(truncated_split_points);
    if combined_secret.is_err() {
        return Err(combined_secret.err().unwrap());
    }

    Ok(combined_secret.unwrap())
}
