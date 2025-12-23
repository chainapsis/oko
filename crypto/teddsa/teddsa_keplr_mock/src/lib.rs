//! FROST Ed25519 Threshold Signatures for Oko
//!
//! This library provides threshold EdDSA signatures using the FROST protocol
//! on the Ed25519 curve. It is designed to work alongside the existing
//! cait_sith_keplr library which provides threshold ECDSA on secp256k1.
//!
//! # Overview
//!
//! FROST (Flexible Round-Optimized Schnorr Threshold) is a threshold signature
//! scheme that allows a group of participants to collaboratively sign messages
//! without any single party having access to the full private key.
//!
//! This implementation uses a 2-of-2 threshold scheme, matching the security
//! model of oko's existing secp256k1 implementation:
//! - One share is held by the user (keygen_1)
//! - One share is held by the server (keygen_2)
//! - Both shares are required to produce a valid signature
//!
//! # Usage
//!
//! ## Key Generation
//!
//! ```rust,ignore
//! use teddsa_keplr_mock::keygen_centralized::keygen_centralized;
//!
//! let keygen_output = keygen_centralized().expect("keygen failed");
//!
//! // keygen_output.keygen_outputs[0] -> user's share (keygen_1)
//! // keygen_output.keygen_outputs[1] -> server's share (keygen_2)
//! // keygen_output.public_key -> the Ed25519 public key (32 bytes)
//! ```
//!
//! ## Signing
//!
//! The signing process has two rounds:
//!
//! 1. **Round 1**: Each participant generates nonces and commitments
//! 2. **Round 2**: Each participant generates their signature share
//! 3. **Aggregation**: Signature shares are combined into the final signature
//!
//! ```rust,ignore
//! use teddsa_keplr_mock::sign::{sign_round1, sign_round2, aggregate};
//!
//! // Round 1: Generate commitments
//! let round1_1 = sign_round1(&key_package_1)?;
//! let round1_2 = sign_round1(&key_package_2)?;
//!
//! // Collect commitments
//! let all_commitments = vec![
//!     (round1_1.identifier, round1_1.commitments),
//!     (round1_2.identifier, round1_2.commitments),
//! ];
//!
//! // Round 2: Generate signature shares
//! let message = b"hello solana";
//! let round2_1 = sign_round2(message, &key_package_1, &round1_1.nonces, &all_commitments)?;
//! let round2_2 = sign_round2(message, &key_package_2, &round1_2.nonces, &all_commitments)?;
//!
//! // Aggregate into final signature
//! let all_shares = vec![
//!     (round2_1.identifier, round2_1.signature_share),
//!     (round2_2.identifier, round2_2.signature_share),
//! ];
//! let signature = aggregate(message, &all_commitments, &all_shares, &public_key_package)?;
//! ```

pub mod error;
pub mod keygen_centralized;
pub mod sign;
pub mod types;

// Re-exports for convenience
pub use error::FrostError;
pub use keygen_centralized::{keygen_centralized, keygen_import};
pub use sign::{aggregate, sign_round1, sign_round2, verify};
pub use types::{
    CentralizedKeygenOutput, KeygenOutput, SignatureOutput, SignatureShareOutput,
    SigningCommitmentOutput,
};
