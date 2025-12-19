use frost_core::SigningKey;
use frost_ed25519::{
    keys::{split, IdentifierList},
    rand_core::OsRng,
    Ed25519Sha512, Identifier,
};

use crate::point::Point256;

pub fn sss_split_ed25519(
    secret_be: [u8; 32],
    point_xs: Vec<[u8; 32]>,
    t: u32,
) -> Result<Vec<Point256>, String> {
    let mut secret_le = secret_be;
    secret_le.reverse();
    let secret_be_slice = secret_le;
    let signing_key = SigningKey::<Ed25519Sha512>::deserialize(secret_be_slice.as_slice())
        .expect("Failed to deserialize signing key");

    let max_signers = point_xs.len() as u16;
    let min_signers = t as u16;

    let identifiers = point_xs
        .iter()
        .map(|&x| Identifier::deserialize(x.as_slice()).expect("Failed to deserialize identifier"))
        .collect::<Vec<_>>();
    let identifier_list = IdentifierList::Custom(&identifiers);

    let mut rng = OsRng;
    let share_map_tup = split(
        &signing_key,
        max_signers,
        min_signers,
        identifier_list,
        &mut rng,
    )
    .expect("Failed to split");
    let share_vec = share_map_tup.0.into_iter().collect::<Vec<_>>();

    let share_points: Vec<Point256> = share_vec
        .into_iter()
        .map(|(identifier, share)| Point256 {
            x: identifier.to_scalar().to_bytes(),
            y: share.signing_share().to_scalar().to_bytes(),
        })
        .collect();

    Ok(share_points)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sss_split_ed25519() {
        let mut secret = [0u8; 32];
        secret[31] = 1;
        let mut point_xs = vec![[0u8; 32]; 3];
        point_xs[0][31] = 1;
        point_xs[1][31] = 2;
        point_xs[2][31] = 3;
        let t = 2;

        let max_signers = point_xs.len() as u16;
        let min_signers = t as u16;

        let signing_key = SigningKey::<Ed25519Sha512>::deserialize(secret.as_slice())
            .expect("Failed to deserialize signing key");

        let identifiers = point_xs
            .iter()
            .map(|&x| {
                Identifier::deserialize(x.as_slice()).expect("Failed to deserialize identifier")
            })
            .collect::<Vec<_>>();
        let identifier_list = IdentifierList::Custom(&identifiers);

        let mut rng = OsRng;
        let out = split(
            &signing_key,
            max_signers,
            min_signers,
            identifier_list,
            &mut rng,
        )
        .expect("Failed to split");

        let i_0 = identifiers.get(0).unwrap();
        let out_0 = out.0.get(identifiers.get(0).unwrap()).unwrap();
        let out_0_signing_share = out_0.signing_share();
        println!("out_0_signing_share: {:?}", out_0_signing_share.to_scalar());
        println!("i_0: {:?}", i_0.to_scalar().to_bytes());

        let i_1 = identifiers.get(1).unwrap();
        let out_1 = out.0.get(identifiers.get(1).unwrap()).unwrap();
        let out_1_signing_share = out_1.signing_share();
        println!("out_1_signing_share: {:?}", out_1_signing_share.to_scalar());
        println!("i_1: {:?}", i_1.to_scalar().to_bytes());
    }

    #[test]
    fn test_secret_key_endian() {
        println!("test_secret_key_endian");
        let mut secret = [255u8; 32];
        secret[0] = 0;
        let signing_key = SigningKey::<Ed25519Sha512>::deserialize(secret.as_slice())
            .expect("Failed to deserialize signing key");
        println!("signing_key: {:?}", signing_key.to_scalar());
    }
}
