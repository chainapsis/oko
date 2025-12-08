use serde::{ser::SerializeTuple, Deserialize, Serialize};
use std::fmt;

use crate::error::CryptoError;

#[derive(Clone, Copy, PartialEq, Eq, Ord, PartialOrd, Hash)]
pub struct HexSerializedBytes<const N: usize> {
    pub data: [u8; N],
}

impl<const N: usize> HexSerializedBytes<N> {
    const fn zero() -> Self {
        Self { data: [0; N] }
    }

    pub fn from_hex(hex: &str) -> Result<Self, CryptoError> {
        let bytes = hex::decode(hex).map_err(|e| CryptoError::InvalidFormat(e.to_string()))?;
        if bytes.len() != N {
            return Err(CryptoError::InvalidFormat("invalid length".to_string()));
        }
        let data = bytes.try_into().map_err(|_| {
            CryptoError::InvalidFormat(format!("Failed to convert to array of length {}", N))
        })?;
        Ok(Self { data })
    }
}

impl<const N: usize> Serialize for HexSerializedBytes<N> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        if serializer.is_human_readable() {
            serializer.serialize_str(hex::encode(self.data).as_str())
        } else {
            let mut seq = serializer.serialize_tuple(N)?;
            for e in self.data {
                seq.serialize_element(&e)?;
            }
            seq.end()
        }
    }
}

impl<const N: usize> fmt::Debug for HexSerializedBytes<N> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.data).as_str())
    }
}

impl<const N: usize> fmt::Display for HexSerializedBytes<N> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.data).as_str())
    }
}

impl<'de, const N: usize> Deserialize<'de> for HexSerializedBytes<N> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        if deserializer.is_human_readable() {
            let s: String = Deserialize::deserialize(deserializer)?;
            let bytes = hex::decode(s).map_err(|e| serde::de::Error::custom(e.to_string()))?;
            if bytes.len() != N {
                return Err(serde::de::Error::custom("invalid length"));
            }
            let mut data = [0; N];
            data.copy_from_slice(&bytes);
            Ok(HexSerializedBytes { data })
        } else {
            struct V<const M: usize>;
            impl<'de, const M: usize> serde::de::Visitor<'de> for V<M> {
                type Value = [u8; M];

                fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                    formatter.write_str("byte")
                }

                fn visit_seq<S: serde::de::SeqAccess<'de>>(
                    self,
                    mut seq: S,
                ) -> Result<Self::Value, S::Error> {
                    let mut data = [0; M];
                    for (i, x) in data.iter_mut().enumerate() {
                        *x = seq
                            .next_element()?
                            .ok_or_else(|| serde::de::Error::invalid_length(i, &self))?;
                    }
                    Ok(data)
                }
            }
            let data = deserializer.deserialize_tuple(N, V::<N>)?;
            Ok(HexSerializedBytes { data })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const ZERO_32: [u8; 32] = [0; 32];

    const ZERO_32_HEX: &str = "0000000000000000000000000000000000000000000000000000000000000000";

    const ZERO_31_HEX: &str = "000000000000000000000000000000000000000000000000000000000000000";

    const ZERO_33_HEX: &str = "00000000000000000000000000000000000000000000000000000000000000000";

    #[test]
    fn test_hex_serialized_bytes() {
        let bytes = HexSerializedBytes::<32>::zero();
        assert_eq!(bytes.data, [0; 32]);
    }

    #[test]
    fn test_hex_serialized_bytes_from_hex() {
        let bytes = HexSerializedBytes::<32>::from_hex(ZERO_32_HEX).unwrap();
        assert_eq!(bytes.data, ZERO_32);
    }

    #[test]
    #[should_panic]
    fn test_hex_serialized_bytes_from_hex_invalid_length() {
        let result = HexSerializedBytes::<32>::from_hex(ZERO_31_HEX);
        result.expect("should panic");
    }

    #[test]
    #[should_panic]
    fn test_hex_serialized_bytes_from_hex_invalid_hex() {
        let result = HexSerializedBytes::<32>::from_hex(ZERO_33_HEX);
        result.expect("should panic");
    }
}
