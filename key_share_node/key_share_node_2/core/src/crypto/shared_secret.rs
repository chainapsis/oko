use std::fmt::Debug;

use crate::{bytes::HexSerializedBytes, curve::CurveType, error::CryptoError};

pub trait SharedSecret<const N: usize>: Debug + Clone + Send + Sync {
    fn curve_type(&self) -> CurveType;
    fn from_hex_ser_bytes(bytes: &HexSerializedBytes<N>) -> Result<Self, CryptoError>;
    fn to_hex_ser_bytes(&self) -> HexSerializedBytes<N>;

    fn encrypt_aes_256_gcm(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError>;
    fn decrypt_aes_256_gcm(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError>;
}
