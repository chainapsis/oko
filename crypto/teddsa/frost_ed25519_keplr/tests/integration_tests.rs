use frost_ed25519_keplr::*;
use lazy_static::lazy_static;
use serde_json::Value;

#[test]
fn check_zero_key_fails() {
    frost_core::tests::ciphersuite_generic::check_zero_key_fails::<Ed25519Sha512>();
}

#[test]
fn check_sign_with_dkg() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::ciphersuite_generic::check_sign_with_dkg::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_dkg_part1_fails_with_invalid_signers_min_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 1;
    let max_signers = 3;
    let error = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_dkg_part1_fails_with_min_signers_greater_than_max() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 2;
    let error: frost_core::Error<Ed25519Sha512> = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_dkg_part1_fails_with_invalid_signers_max_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 1;
    let error = Error::InvalidMaxSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_rts() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::repairable::check_rts::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_refresh_shares_with_dealer() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dealer::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_refresh_shares_with_dealer_serialisation() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_serialisation::<Ed25519Sha512, _>(
        rng,
    );
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_invalid_public_key_package() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_public_key_package::<
        Ed25519Sha512,
        _,
    >(rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_invalid_min_signers() {
    let rng = rand::rngs::OsRng;
    let identifiers = vec![
        Identifier::try_from(1).unwrap(),
        Identifier::try_from(3).unwrap(),
        Identifier::try_from(4).unwrap(),
        Identifier::try_from(5).unwrap(),
    ];
    let min_signers = 1;
    let max_signers = 4;
    let error = Error::InvalidMinSigners;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(max_signers, min_signers, &identifiers, error, rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_unequal_num_identifiers_and_max_signers() {
    let rng = rand::rngs::OsRng;
    let identifiers = vec![
        Identifier::try_from(1).unwrap(),
        Identifier::try_from(3).unwrap(),
        Identifier::try_from(4).unwrap(),
        Identifier::try_from(5).unwrap(),
    ];
    let min_signers = 3;
    let max_signers = 3;
    let error: frost_core::Error<Ed25519Sha512> = Error::IncorrectNumberOfIdentifiers;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(max_signers, min_signers, &identifiers, error, rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_min_signers_greater_than_max() {
    let rng = rand::rngs::OsRng;
    let identifiers = vec![
        Identifier::try_from(1).unwrap(),
        Identifier::try_from(3).unwrap(),
        Identifier::try_from(4).unwrap(),
        Identifier::try_from(5).unwrap(),
    ];
    let min_signers = 6;
    let max_signers = 4;
    let error: frost_core::Error<Ed25519Sha512> = Error::InvalidMinSigners;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(max_signers, min_signers, &identifiers, error, rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_invalid_max_signers() {
    let rng = rand::rngs::OsRng;
    let identifiers = vec![Identifier::try_from(1).unwrap()];
    let min_signers = 3;
    let max_signers = 1;
    let error = Error::InvalidMaxSigners;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(max_signers, min_signers, &identifiers, error, rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_invalid_identifier() {
    let rng = rand::rngs::OsRng;
    let identifiers = vec![
        Identifier::try_from(8).unwrap(),
        Identifier::try_from(3).unwrap(),
        Identifier::try_from(4).unwrap(),
        Identifier::try_from(6).unwrap(),
    ];
    let min_signers = 2;
    let max_signers = 4;
    let error = Error::UnknownIdentifier;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(max_signers, min_signers, &identifiers, error, rng);
}

#[test]
fn check_refresh_shares_with_dealer_fails_with_different_min_signers() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dealer_fails_with_different_min_signers::<
        Ed25519Sha512,
        _,
    >(rng);
}

#[test]
fn check_refresh_shares_with_dkg() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dkg::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_refresh_shares_with_dkg_smaller_threshold() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::refresh::check_refresh_shares_with_dkg_smaller_threshold::<Ed25519Sha512, _>(
        rng,
    );
}

#[test]
fn check_sign_with_dealer() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_sign_with_dealer_fails_with_invalid_min_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 1;
    let max_signers = 3;
    let error = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_sign_with_dealer_fails_with_min_signers_greater_than_max() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 2;
    let error: frost_core::Error<Ed25519Sha512> = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_sign_with_dealer_fails_with_invalid_max_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 1;
    let error = Error::InvalidMaxSigners;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

/// This is testing that Shamir's secret sharing to compute and arbitrary
/// value is working.
#[test]
fn check_share_generation_ed25519_sha512() {
    let rng = rand::rngs::OsRng;
    frost_core::tests::ciphersuite_generic::check_share_generation::<Ed25519Sha512, _>(rng);
}

#[test]
fn check_share_generation_fails_with_invalid_min_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 0;
    let max_signers = 3;
    let error = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_share_generation_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_share_generation_fails_with_min_signers_greater_than_max() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 2;
    let error: frost_core::Error<Ed25519Sha512> = Error::InvalidMinSigners;

    frost_core::tests::ciphersuite_generic::check_share_generation_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

#[test]
fn check_share_generation_fails_with_invalid_max_signers() {
    let rng = rand::rngs::OsRng;

    let min_signers = 3;
    let max_signers = 0;
    let error = Error::InvalidMaxSigners;

    frost_core::tests::ciphersuite_generic::check_share_generation_fails_with_invalid_signers::<
        Ed25519Sha512,
        _,
    >(min_signers, max_signers, error, rng);
}

lazy_static! {
    pub static ref VECTORS: Value =
        serde_json::from_str(include_str!("../tests/helpers/vectors.json").trim())
            .expect("Test vector is valid JSON");
    pub static ref VECTORS_BIG_IDENTIFIER: Value =
        serde_json::from_str(include_str!("../tests/helpers/vectors-big-identifier.json").trim())
            .expect("Test vector is valid JSON");
    pub static ref VECTORS_DKG: Value =
        serde_json::from_str(include_str!("../tests/helpers/vectors_dkg.json").trim())
            .expect("Test vector is valid JSON");
}

#[test]
fn check_sign_with_test_vectors() {
    frost_core::tests::vectors::check_sign_with_test_vectors::<Ed25519Sha512>(&VECTORS);
}

#[test]
fn check_sign_with_test_vectors_dkg() {
    frost_core::tests::vectors_dkg::check_dkg_keygen::<Ed25519Sha512>(&VECTORS_DKG);
}

#[test]
fn check_sign_with_test_vectors_with_big_identifiers() {
    frost_core::tests::vectors::check_sign_with_test_vectors::<Ed25519Sha512>(
        &VECTORS_BIG_IDENTIFIER,
    );
}

#[test]
fn check_error_culprit() {
    frost_core::tests::ciphersuite_generic::check_error_culprit::<Ed25519Sha512>();
}

#[test]
fn check_identifier_derivation() {
    frost_core::tests::ciphersuite_generic::check_identifier_derivation::<Ed25519Sha512>();
}

// Explicit test which is used in a documentation snippet
#[test]
#[allow(unused_variables)]
fn check_identifier_generation() -> Result<(), Error> {
    // ANCHOR: dkg_identifier
    let participant_identifier = Identifier::try_from(7u16)?;
    let participant_identifier = Identifier::derive("alice@example.com".as_bytes())?;
    // ANCHOR_END: dkg_identifier
    Ok(())
}

#[test]
fn check_sign_with_dealer_and_identifiers() {
    let rng = rand::rngs::OsRng;

    frost_core::tests::ciphersuite_generic::check_sign_with_dealer_and_identifiers::<
        Ed25519Sha512,
        _,
    >(rng);
}

#[test]
fn check_sign_with_missing_identifier() {
    let rng = rand::rngs::OsRng;
    frost_core::tests::ciphersuite_generic::check_sign_with_missing_identifier::<Ed25519Sha512, _>(
        rng,
    );
}

#[test]
fn check_sign_with_incorrect_commitments() {
    let rng = rand::rngs::OsRng;
    frost_core::tests::ciphersuite_generic::check_sign_with_incorrect_commitments::<Ed25519Sha512, _>(
        rng,
    );
}

/// Test to verify the relationship between identifier and verifying_share.
///
/// In FROST Ed25519:
/// - identifier: SSS polynomial x-coordinate (scalar, 32 bytes)
/// - signing_share: f(identifier) where f is secret polynomial (scalar, 32 bytes)
/// - verifying_share: signing_share * G (EdwardsPoint, compressed 32 bytes)
///
/// The compressed EdwardsY format stores: y-coordinate (255 bits) + x sign bit (1 bit)
/// This test extracts the actual x,y coordinates from verifying_share and verifies
/// that identifier is NOT the x-coordinate of the point (it's the polynomial x-value).
#[test]
fn check_identifier_is_not_verifying_share_x_coordinate() {
    use curve25519_dalek::edwards::CompressedEdwardsY;

    let mut rng = rand::rngs::OsRng;

    // Generate keys with dealer
    let max_signers = 3;
    let min_signers = 2;
    let (shares, pubkeys) = keys::generate_with_dealer(
        max_signers,
        min_signers,
        keys::IdentifierList::Default,
        &mut rng,
    )
    .unwrap();

    // For each participant, check the relationship
    for (identifier, secret_share) in &shares {
        // Get the key package
        let key_package: keys::KeyPackage = secret_share.clone().try_into().unwrap();

        // Get verifying_share bytes (compressed EdwardsY format)
        let verifying_share_bytes = key_package.verifying_share().serialize().unwrap();
        assert_eq!(
            verifying_share_bytes.len(),
            32,
            "verifying_share should be 32 bytes"
        );

        // Decompress to get actual point coordinates
        let compressed = CompressedEdwardsY::from_slice(&verifying_share_bytes).unwrap();
        let point = compressed.decompress().expect("valid point");

        // Get the actual x and y coordinates (as field elements, in bytes)
        // EdwardsPoint internally stores (X, Y, Z, T) in extended coordinates
        // To get affine x, y: x = X/Z, y = Y/Z
        let point_bytes = point.compress().to_bytes();

        // Get identifier bytes
        let identifier_bytes = identifier.serialize();
        assert_eq!(identifier_bytes.len(), 32, "identifier should be 32 bytes");

        // The compressed format is y-coordinate with x's sign bit in the MSB
        // So the first 255 bits are y, and bit 255 is x's sign
        // identifier is a scalar (the x-value in SSS polynomial), NOT the point's x-coordinate

        // Verify that identifier != compressed point bytes (they should be different)
        assert_ne!(
            identifier_bytes, verifying_share_bytes,
            "identifier should NOT equal verifying_share compressed bytes"
        );

        // Also verify that signing_share * G = verifying_share
        let signing_share_bytes = key_package.signing_share().serialize();
        assert_eq!(
            signing_share_bytes.len(),
            32,
            "signing_share should be 32 bytes"
        );

        // The verifying_share from pubkeys should match
        let pubkey_verifying_share = pubkeys.verifying_shares().get(identifier).unwrap();
        assert_eq!(
            key_package.verifying_share().serialize().unwrap(),
            pubkey_verifying_share.serialize().unwrap(),
            "verifying_share should match in key_package and public_key_package"
        );

        println!("Participant {:?}:", identifier);
        println!(
            "  identifier bytes:      {}",
            hex::encode(&identifier_bytes)
        );
        println!(
            "  signing_share bytes:   {}",
            hex::encode(&signing_share_bytes)
        );
        println!(
            "  verifying_share bytes: {}",
            hex::encode(&verifying_share_bytes)
        );
    }
}

/// Test to extract x-coordinate from verifying_share (compressed EdwardsY point).
///
/// Ed25519 compressed format: y-coordinate (255 bits) + x sign bit (1 bit) = 32 bytes
/// To get x-coordinate, we need to decompress the point.
#[test]
fn check_extract_x_coordinate_from_verifying_share() {
    use curve25519_dalek::edwards::CompressedEdwardsY;

    let mut rng = rand::rngs::OsRng;

    let max_signers = 3;
    let min_signers = 2;
    let (shares, _pubkeys) = keys::generate_with_dealer(
        max_signers,
        min_signers,
        keys::IdentifierList::Default,
        &mut rng,
    )
    .unwrap();

    for (identifier, secret_share) in &shares {
        let key_package: keys::KeyPackage = secret_share.clone().try_into().unwrap();

        // Get verifying_share (compressed point)
        let verifying_share_bytes = key_package.verifying_share().serialize().unwrap();

        // Decompress
        let compressed = CompressedEdwardsY::from_slice(&verifying_share_bytes).unwrap();
        let point = compressed.decompress().expect("valid point");

        // Extract y-coordinate from compressed bytes (first 255 bits)
        let mut y_bytes = verifying_share_bytes.clone();
        y_bytes[31] &= 0x7F; // Clear the sign bit to get pure y

        // The x sign bit
        let x_sign = (verifying_share_bytes[31] >> 7) & 1;

        println!("Participant {:?}:", identifier);
        println!(
            "  compressed bytes: {}",
            hex::encode(&verifying_share_bytes)
        );
        println!("  y-coordinate:     {}", hex::encode(&y_bytes));
        println!("  x sign bit:       {}", x_sign);

        // Verify the point is valid by recompressing
        let recompressed = point.compress();
        assert_eq!(
            recompressed.to_bytes(),
            verifying_share_bytes.as_slice(),
            "recompressed point should match original"
        );
    }
}
