use serde::{Deserialize, Serialize};

/// Output from centralized key generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralizedKeygenOutput {
    /// The full private key (only available in centralized keygen)
    pub private_key: Vec<u8>,
    /// Key shares for each participant (2-of-2)
    pub keygen_outputs: Vec<KeygenOutput>,
    /// The public verifying key
    pub public_key: Vec<u8>,
}

/// A single participant's key share
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeygenOutput {
    /// Serialized KeyPackage for this participant
    pub key_package: Vec<u8>,
    /// Serialized PublicKeyPackage (shared among all participants)
    pub public_key_package: Vec<u8>,
    /// Participant identifier
    pub identifier: Vec<u8>,
}

/// Output from a signing round 1 (commitment)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SigningCommitmentOutput {
    /// Serialized SigningNonces (must be kept secret, used in round 2)
    pub nonces: Vec<u8>,
    /// Serialized SigningCommitments (sent to coordinator)
    pub commitments: Vec<u8>,
    /// Participant identifier
    pub identifier: Vec<u8>,
}

/// Output from a signing round 2 (signature share)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureShareOutput {
    /// Serialized SignatureShare
    pub signature_share: Vec<u8>,
    /// Participant identifier
    pub identifier: Vec<u8>,
}

/// Final aggregated signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureOutput {
    /// The 64-byte Ed25519 signature
    pub signature: Vec<u8>,
}
