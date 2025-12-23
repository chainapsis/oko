use thiserror::Error;

#[derive(Error, Debug)]
pub enum FrostError {
    #[error("Key generation failed: {0}")]
    KeygenError(String),

    #[error("Signing round 1 failed: {0}")]
    Round1Error(String),

    #[error("Signing round 2 failed: {0}")]
    Round2Error(String),

    #[error("Signature aggregation failed: {0}")]
    AggregationError(String),

    #[error("Serialization failed: {0}")]
    SerializationError(String),

    #[error("Deserialization failed: {0}")]
    DeserializationError(String),

    #[error("Invalid parameter: {0}")]
    InvalidParameter(String),

    #[error("SSS operation failed: {0}")]
    SssError(String),
}
