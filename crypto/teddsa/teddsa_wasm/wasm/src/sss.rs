use gloo_utils::format::JsValueSerdeExt;
use teddsa_core::sss;
use wasm_bindgen::prelude::*;
use web_sys::console;

/// Serializable Point structure for JS interop
#[derive(serde::Serialize, serde::Deserialize)]
pub struct PointSerde {
    pub x: [u8; 32],
    pub y: [u8; 32],
}

/// Extract the signing_share (32-byte scalar) from a serialized KeyPackage.
///
/// # Arguments
/// * `key_package` - Serialized FROST KeyPackage bytes
///
/// # Returns
/// The 32-byte signing_share scalar as a number array
#[wasm_bindgen]
pub fn extract_signing_share(key_package: JsValue) -> Result<JsValue, JsValue> {
    console::log_1(&"[WASM] extract_signing_share: starting deserialization".into());

    let key_package_bytes: Vec<u8> = match key_package.into_serde() {
        Ok(bytes) => bytes,
        Err(e) => {
            console::error_1(&format!("[WASM] serde deserialization failed: {}", e).into());
            return Err(JsValue::from_str(&e.to_string()));
        }
    };

    console::log_1(&format!(
        "[WASM] extract_signing_share: received {} bytes, first 10: {:?}",
        key_package_bytes.len(),
        &key_package_bytes[..std::cmp::min(10, key_package_bytes.len())]
    ).into());

    let signing_share = match sss::extract_signing_share(&key_package_bytes) {
        Ok(share) => share,
        Err(e) => {
            console::error_1(&format!("[WASM] extract_signing_share FROST error: {}", e).into());
            return Err(JsValue::from_str(&e.to_string()));
        }
    };

    console::log_1(&"[WASM] extract_signing_share: success".into());

    JsValue::from_serde(&signing_share.to_vec())
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Split a 32-byte secret into shares using Shamir's Secret Sharing.
///
/// # Arguments
/// * `secret` - The 32-byte secret (signing_share scalar) as a number array
/// * `point_xs` - Array of 32-byte identifiers (derived from KS node names)
/// * `threshold` - Minimum number of shares required to reconstruct
///
/// # Returns
/// Array of points, each with x (identifier) and y (share value)
#[wasm_bindgen]
pub fn sss_split(secret: JsValue, point_xs: JsValue, threshold: u32) -> Result<JsValue, JsValue> {
    let secret_vec: Vec<u8> = secret
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let secret_arr: [u8; 32] = secret_vec
        .try_into()
        .map_err(|_| JsValue::from_str("Secret must be exactly 32 bytes"))?;

    let point_xs_vec: Vec<Vec<u8>> = point_xs
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let point_xs_arr: Vec<[u8; 32]> = point_xs_vec
        .into_iter()
        .map(|v| {
            v.try_into()
                .map_err(|_| JsValue::from_str("Each point_x must be exactly 32 bytes"))
        })
        .collect::<Result<Vec<_>, _>>()?;

    let points = sss::sss_split(secret_arr, point_xs_arr, threshold)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let serializable_points: Vec<PointSerde> = points
        .into_iter()
        .map(|p| PointSerde { x: p.x, y: p.y })
        .collect();

    JsValue::from_serde(&serializable_points).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Combine shares to recover the original 32-byte secret.
///
/// # Arguments
/// * `points` - Array of points to combine, each with x (identifier) and y (share value)
/// * `threshold` - The threshold used during splitting
///
/// # Returns
/// The recovered 32-byte secret (signing_share scalar) as a number array
#[wasm_bindgen]
pub fn sss_combine(points: JsValue, threshold: u32) -> Result<JsValue, JsValue> {
    let points_serde: Vec<PointSerde> = points
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let points: Vec<frost_ed25519_keplr::Point256> = points_serde
        .into_iter()
        .map(|p| frost_ed25519_keplr::Point256 { x: p.x, y: p.y })
        .collect();

    let secret = sss::sss_combine(points, threshold)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    JsValue::from_serde(&secret.to_vec()).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Reconstruct a KeyPackage from a signing_share and public information.
///
/// # Arguments
/// * `signing_share` - The recovered 32-byte signing_share scalar as a number array
/// * `public_key_package` - Serialized PublicKeyPackage bytes
/// * `identifier` - The participant's identifier bytes
///
/// # Returns
/// The reconstructed and serialized KeyPackage bytes
#[wasm_bindgen]
pub fn reconstruct_key_package(
    signing_share: JsValue,
    public_key_package: JsValue,
    identifier: JsValue,
) -> Result<JsValue, JsValue> {
    let signing_share_vec: Vec<u8> = signing_share
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let signing_share_arr: [u8; 32] = signing_share_vec
        .try_into()
        .map_err(|_| JsValue::from_str("Signing share must be exactly 32 bytes"))?;

    let public_key_package_bytes: Vec<u8> = public_key_package
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let identifier_bytes: Vec<u8> = identifier
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let key_package = sss::reconstruct_key_package(
        signing_share_arr,
        &public_key_package_bytes,
        &identifier_bytes,
    )
    .map_err(|e| JsValue::from_str(&e.to_string()))?;

    JsValue::from_serde(&key_package).map_err(|e| JsValue::from_str(&e.to_string()))
}
