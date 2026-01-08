use curve25519_dalek::constants::ED25519_BASEPOINT_TABLE;
use curve25519_dalek::scalar::Scalar;
use gloo_utils::format::JsValueSerdeExt;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct ScalarBaseMultInput {
    pub scalar: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct ScalarBaseMultOutput {
    pub point: Vec<u8>,
}

/// Compute verifying_share (point) from signing_share (scalar).
/// verifying_share = signing_share * G (Ed25519 base point)
#[wasm_bindgen]
pub fn scalar_base_mult(input: JsValue) -> Result<JsValue, JsValue> {
    let input: ScalarBaseMultInput = input
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("Failed to parse input: {}", e)))?;

    let result =
        scalar_base_mult_inner(&input).map_err(|e| JsValue::from_str(&format!("{}", e)))?;

    JsValue::from_serde(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize output: {}", e)))
}

fn scalar_base_mult_inner(input: &ScalarBaseMultInput) -> Result<ScalarBaseMultOutput, String> {
    if input.scalar.len() != 32 {
        return Err(format!(
            "Invalid scalar length: expected 32, got {}",
            input.scalar.len()
        ));
    }

    let scalar_bytes: [u8; 32] = input
        .scalar
        .clone()
        .try_into()
        .map_err(|_| "Failed to convert scalar bytes")?;

    let scalar = Scalar::from_bytes_mod_order(scalar_bytes);
    let point = &scalar * ED25519_BASEPOINT_TABLE;
    let point_bytes = point.compress().to_bytes();

    Ok(ScalarBaseMultOutput {
        point: point_bytes.to_vec(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scalar_base_mult_valid() {
        let mut scalar = vec![0u8; 32];
        scalar[0] = 1;

        let input = ScalarBaseMultInput { scalar };
        let result = scalar_base_mult_inner(&input).unwrap();

        assert_eq!(result.point.len(), 32);
    }

    #[test]
    fn test_scalar_base_mult_invalid_length() {
        let input = ScalarBaseMultInput {
            scalar: vec![1u8; 16],
        };
        let result = scalar_base_mult_inner(&input);
        assert!(result.is_err());
    }
}
