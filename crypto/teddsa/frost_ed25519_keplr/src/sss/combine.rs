use crate::{point::Point256, sss_ed25519::interpolate_ed25519};

pub fn sss_combine_ed25519(split_points: Vec<Point256>, t: u32) -> Result<[u8; 32], String> {
    if split_points.len() < t as usize {
        return Err("Not enough keyshare points to combine".to_string());
    }

    let truncated_split_points = split_points.iter().take(t as usize).collect::<Vec<_>>();

    let combined_secret_le = interpolate_ed25519(truncated_split_points);
    if combined_secret_le.is_err() {
        return Err(combined_secret_le.err().unwrap());
    }
    let mut combined_secret = combined_secret_le.unwrap();
    combined_secret.reverse();

    Ok(combined_secret)
}
