use alloc::collections::BTreeSet;
use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use frost_core::{Scalar, SigningKey};
use rand_core::{CryptoRng, RngCore};

use crate::keys::{split, IdentifierList};
use crate::point::Point256;
use crate::sss::compute_lagrange_coefficient;
use crate::{Ed25519Sha512, Identifier};

/// Result of a reshare operation.
#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ReshareResult {
    /// Threshold value (minimum shares required to reconstruct).
    pub t: u32,
    /// The reshared points for each node.
    pub reshared_points: Vec<Point256>,
    /// The recovered secret.
    pub secret: [u8; 32],
}

/// Reshares existing keyshares to a new set of nodes with a fresh polynomial.
///
/// This function recovers the secret from existing shares and creates new shares
/// for a potentially different set of nodes using a new random polynomial.
pub fn reshare<R: RngCore + CryptoRng>(
    split_points: Vec<Point256>,
    new_ks_node_hashes: Vec<[u8; 32]>,
    t: u32,
    rng: &mut R,
) -> Result<ReshareResult, String> {
    if split_points.len() < t as usize {
        return Err("Split points must be greater than t".to_string());
    }

    if new_ks_node_hashes.len() < t as usize {
        return Err("New KS node hashes must be greater than t".to_string());
    }

    // Take first t points for interpolation
    let truncated_points = split_points.iter().take(t as usize).collect::<Vec<_>>();

    // Build identifier set from x coordinates
    let identifiers = truncated_points
        .iter()
        .map(|p| {
            Identifier::deserialize(p.x.as_slice())
                .map_err(|e| format!("Failed to deserialize identifier: {:?}", e))
        })
        .collect::<Result<BTreeSet<_>, String>>()?;

    // Compute Lagrange coefficients and interpolate to recover secret
    let coeffs = identifiers
        .iter()
        .map(|id| {
            compute_lagrange_coefficient::<Ed25519Sha512>(&identifiers, None, *id)
                .map_err(|e| format!("Failed to compute lagrange coefficient: {:?}", e))
        })
        .collect::<Result<Vec<_>, String>>()?;

    let mut secret_scalar = Scalar::<Ed25519Sha512>::ZERO;
    for (i, coeff) in coeffs.iter().enumerate() {
        let y_scalar = SigningKey::<Ed25519Sha512>::deserialize(truncated_points[i].y.as_slice())
            .map_err(|e| format!("Failed to deserialize signing key: {:?}", e))?
            .to_scalar();
        secret_scalar = secret_scalar + *coeff * y_scalar;
    }

    let secret = secret_scalar.to_bytes();

    // Create new shares using fresh polynomial
    let signing_key = SigningKey::<Ed25519Sha512>::deserialize(secret.as_slice())
        .map_err(|e| format!("Failed to deserialize signing key: {:?}", e))?;

    let max_signers = new_ks_node_hashes.len() as u16;
    let min_signers = t as u16;

    let new_identifiers = new_ks_node_hashes
        .iter()
        .map(|&x| {
            Identifier::deserialize(x.as_slice())
                .map_err(|e| format!("Failed to deserialize identifier: {:?}", e))
        })
        .collect::<Result<Vec<_>, String>>()?;
    let identifier_list = IdentifierList::Custom(&new_identifiers);

    let share_map_tup = split(&signing_key, max_signers, min_signers, identifier_list, rng)
        .map_err(|e| format!("Failed to split: {:?}", e))?;
    let share_vec = share_map_tup.0.into_iter().collect::<Vec<_>>();

    let reshared_points: Vec<Point256> = share_vec
        .into_iter()
        .map(|(identifier, share)| Point256 {
            x: identifier.to_scalar().to_bytes(),
            y: share.signing_share().to_scalar().to_bytes(),
        })
        .collect();

    Ok(ReshareResult {
        t,
        reshared_points,
        secret,
    })
}

/// Expands existing shares to include additional nodes without changing the polynomial.
///
/// This function uses Lagrange interpolation to compute share values for new nodes
/// based on the existing shares, preserving the original polynomial.
pub fn expand_shares(
    split_points: Vec<Point256>,
    additional_ks_node_hashes: Vec<[u8; 32]>,
    t: u32,
) -> Result<ReshareResult, String> {
    if split_points.len() < t as usize {
        return Err("Split points must be greater than t".to_string());
    }

    // Check that new hashes are not already in split_points
    for split_point in split_points.iter() {
        for new_hash in additional_ks_node_hashes.iter() {
            if split_point.x == *new_hash {
                return Err("New hash is already included in split points".to_string());
            }
        }
    }

    // Take first t points for interpolation
    let truncated_points = split_points.iter().take(t as usize).collect::<Vec<_>>();

    // Build identifier set from x coordinates
    let identifiers = truncated_points
        .iter()
        .map(|p| {
            Identifier::deserialize(p.x.as_slice())
                .map_err(|e| format!("Failed to deserialize identifier: {:?}", e))
        })
        .collect::<Result<BTreeSet<_>, String>>()?;

    // Recover secret for result
    let coeffs_at_zero = identifiers
        .iter()
        .map(|id| {
            compute_lagrange_coefficient::<Ed25519Sha512>(&identifiers, None, *id)
                .map_err(|e| format!("Failed to compute lagrange coefficient: {:?}", e))
        })
        .collect::<Result<Vec<_>, String>>()?;

    let mut secret_scalar = Scalar::<Ed25519Sha512>::ZERO;
    for (i, coeff) in coeffs_at_zero.iter().enumerate() {
        let y_scalar = SigningKey::<Ed25519Sha512>::deserialize(truncated_points[i].y.as_slice())
            .map_err(|e| format!("Failed to deserialize signing key: {:?}", e))?
            .to_scalar();
        secret_scalar = secret_scalar + *coeff * y_scalar;
    }
    let secret = secret_scalar.to_bytes();

    // Compute new points using Lagrange interpolation at new x values
    let new_points = additional_ks_node_hashes
        .iter()
        .map(|&new_hash| {
            let x_identifier = Identifier::deserialize(new_hash.as_slice())
                .map_err(|e| format!("Failed to deserialize identifier: {:?}", e))?;

            // Compute Lagrange coefficients at the new x value
            let coeffs_at_x = identifiers
                .iter()
                .map(|id| {
                    compute_lagrange_coefficient::<Ed25519Sha512>(
                        &identifiers,
                        Some(x_identifier),
                        *id,
                    )
                    .map_err(|e| format!("Failed to compute lagrange coefficient: {:?}", e))
                })
                .collect::<Result<Vec<_>, String>>()?;

            // Interpolate y value
            let mut y_scalar = Scalar::<Ed25519Sha512>::ZERO;
            for (i, coeff) in coeffs_at_x.iter().enumerate() {
                let point_y_scalar =
                    SigningKey::<Ed25519Sha512>::deserialize(truncated_points[i].y.as_slice())
                        .map_err(|e| format!("Failed to deserialize signing key: {:?}", e))?
                        .to_scalar();
                y_scalar = y_scalar + *coeff * point_y_scalar;
            }

            Ok(Point256 {
                x: x_identifier.to_scalar().to_bytes(),
                y: y_scalar.to_bytes(),
            })
        })
        .collect::<Result<Vec<Point256>, String>>()?;

    let reshared_points = [split_points.clone(), new_points].concat();

    Ok(ReshareResult {
        t,
        reshared_points,
        secret,
    })
}
