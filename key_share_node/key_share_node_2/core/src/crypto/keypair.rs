use std::fmt::Debug;

use crate::{
    bytes::HexSerializedBytes, crypto::shared_secret::SharedSecret, curve::CurveType,
    error::CryptoError,
};

/// N: uncompressed size, M: compressed size
pub trait PublicKey<const N: usize, const M: usize>: Debug + Clone + Send + Sync {
    fn curve_type(&self) -> CurveType;
    fn is_compressed(&self) -> bool;
    fn from_compressed_hex_ser_bytes(bytes: &HexSerializedBytes<M>) -> Result<Self, CryptoError>;
    fn from_uncompressed_hex_ser_bytes(bytes: &HexSerializedBytes<N>) -> Result<Self, CryptoError>;
    fn to_compressed_hex_ser_bytes(&self) -> HexSerializedBytes<M>;
    fn to_uncompressed_hex_ser_bytes(&self) -> HexSerializedBytes<N>;

    // fn verify(&self, message: &[u8], signature: &[u8]) -> Result<bool, CryptoError>;
}

/// N: uncompressed size, M: compressed size
pub trait PrivateKey<const N: usize, const M: usize>: Debug + Clone + Send + Sync {
    type PublicKey: PublicKey<N, M>;
    type SharedSecret: SharedSecret<N>;

    fn curve_type(&self) -> CurveType;
    fn from_hex_ser_bytes(bytes: &HexSerializedBytes<M>) -> Result<Self, CryptoError>;
    fn to_hex_ser_bytes(&self) -> HexSerializedBytes<M>;

    fn public_key(&self) -> Self::PublicKey;
    fn diffie_hellman(
        &self,
        counter_party_public_key: &Self::PublicKey,
    ) -> Result<Self::SharedSecret, CryptoError>;

    // fn sign(&self, message: &[u8]) -> Result<Vec<u8>, CryptoError>;
}
