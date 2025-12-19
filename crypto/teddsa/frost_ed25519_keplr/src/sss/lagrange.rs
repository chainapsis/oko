use std::collections::BTreeSet;

use frost_core::{Ciphersuite, Error, Field, Group, Identifier, Scalar, SigningKey};
use frost_ed25519::Ed25519Sha512;

use crate::point::Point256;

pub fn compute_lagrange_coefficient<C: Ciphersuite>(
    x_set: &BTreeSet<Identifier<C>>,
    x: Option<Identifier<C>>,
    x_i: Identifier<C>,
) -> Result<Scalar<C>, Error<C>> {
    if x_set.is_empty() {
        return Err(Error::IncorrectNumberOfIdentifiers);
    }
    let mut num = <<C::Group as Group>::Field>::one();
    let mut den = <<C::Group as Group>::Field>::one();

    let mut x_i_found = false;

    for x_j in x_set.iter() {
        if x_i == *x_j {
            x_i_found = true;
            continue;
        }

        if let Some(x) = x {
            num = num * (x.to_scalar() - x_j.to_scalar());
            den = den * (x_i.to_scalar() - x_j.to_scalar());
        } else {
            // Both signs inverted just to avoid requiring Neg (-*xj)
            num = num * x_j.to_scalar();
            den = den * (x_j.to_scalar() - x_i.to_scalar());
        }
    }
    if !x_i_found {
        return Err(Error::UnknownIdentifier);
    }

    Ok(
        num * <<C::Group as Group>::Field>::invert(&den)
            .map_err(|_| Error::DuplicatedIdentifier)?,
    )
}

pub fn interpolate_ed25519(keyshares: Vec<&Point256>) -> Result<[u8; 32], String> {
    let x_vec = keyshares.iter().map(|k| k.x).collect::<Vec<_>>();
    let identifiers = x_vec
        .iter()
        .map(|x| {
            Identifier::<Ed25519Sha512>::deserialize(x.as_slice())
                .expect("Failed to deserialize identifier")
        })
        .collect::<BTreeSet<_>>();
    let coeffs = identifiers
        .iter()
        .map(|id| {
            compute_lagrange_coefficient::<Ed25519Sha512>(&identifiers, None, *id)
                .expect("Failed to compute lagrange coefficient")
        })
        .collect::<Vec<_>>();
    let mut sum = Scalar::<Ed25519Sha512>::ZERO;
    for (i, coeff) in coeffs.iter().enumerate() {
        let y_scalar = SigningKey::<Ed25519Sha512>::deserialize(keyshares[i].y.as_slice())
            .expect("Failed to deserialize signing key")
            .to_scalar();
        sum = sum + *coeff * y_scalar;
    }
    Ok(sum.to_bytes())
}
