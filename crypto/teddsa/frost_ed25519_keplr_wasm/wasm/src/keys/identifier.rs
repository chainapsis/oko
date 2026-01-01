use serde::{Deserialize, Serialize};

pub type IdentifierHex = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifierRaw {
    pub bytes: [u8; 32],
}

impl IdentifierRaw {
    pub fn from_bytes(bytes: [u8; 32]) -> Self {
        Self { bytes }
    }

    pub fn from_hex(hex: String) -> Result<Self, String> {
        let b = hex::decode(hex).unwrap();
        let bytes = b.try_into().map_err(|_| "Invalid hex length".to_string())?;
        Ok(Self { bytes })
    }

    pub fn to_bytes(&self) -> [u8; 32] {
        self.bytes.clone()
    }

    pub fn to_string(&self) -> String {
        hex::encode(self.bytes)
    }
}
