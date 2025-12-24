use frost_ed25519_keplr as frost;
use frost::{sss_combine_ed25519, sss_split_ed25519, Point256};
use gloo_utils::format::JsValueSerdeExt;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;
use web_sys::console;

/// Serializable Point structure for JS interop
#[derive(serde::Serialize, serde::Deserialize)]
pub struct PointSerde {
    pub x: [u8; 32],
    pub y: [u8; 32],
}

fn extract_signing_share_inner(key_package_bytes: &[u8]) -> Result<[u8; 32], String> {
    let key_package =
        frost::keys::KeyPackage::deserialize(key_package_bytes).map_err(|e| e.to_string())?;

    let signing_share = key_package.signing_share();
    let scalar_bytes = signing_share.to_scalar().to_bytes();

    Ok(scalar_bytes)
}

fn sss_split_inner(
    secret: [u8; 32],
    point_xs: Vec<[u8; 32]>,
    threshold: u32,
) -> Result<Vec<Point256>, String> {
    let mut rng = OsRng;
    sss_split_ed25519(secret, point_xs, threshold, &mut rng)
}

fn sss_combine_inner(points: Vec<Point256>, threshold: u32) -> Result<[u8; 32], String> {
    sss_combine_ed25519(points, threshold)
}

fn reconstruct_key_package_inner(
    signing_share_bytes: [u8; 32],
    public_key_package_bytes: &[u8],
    identifier_bytes: &[u8],
) -> Result<Vec<u8>, String> {
    let public_key_package =
        frost::keys::PublicKeyPackage::deserialize(public_key_package_bytes)
            .map_err(|e| e.to_string())?;

    let identifier_arr: [u8; 32] = identifier_bytes
        .try_into()
        .map_err(|_| "Invalid identifier length".to_string())?;
    let identifier =
        frost::Identifier::deserialize(&identifier_arr).map_err(|e| e.to_string())?;

    let signing_share = frost::keys::SigningShare::deserialize(&signing_share_bytes)
        .map_err(|e| e.to_string())?;

    let verifying_shares = public_key_package.verifying_shares();
    let verifying_share = verifying_shares
        .get(&identifier)
        .ok_or_else(|| "Identifier not found in public key package".to_string())?;

    let verifying_key = *public_key_package.verifying_key();

    let key_package = frost::keys::KeyPackage::new(
        identifier,
        signing_share,
        *verifying_share,
        verifying_key,
        2,
    );

    key_package.serialize().map_err(|e| e.to_string())
}

/// Extract the signing_share (32-byte scalar) from a serialized KeyPackage.
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

    console::log_1(
        &format!(
            "[WASM] extract_signing_share: received {} bytes, first 10: {:?}",
            key_package_bytes.len(),
            &key_package_bytes[..std::cmp::min(10, key_package_bytes.len())]
        )
        .into(),
    );

    let signing_share = match extract_signing_share_inner(&key_package_bytes) {
        Ok(share) => share,
        Err(e) => {
            console::error_1(&format!("[WASM] extract_signing_share FROST error: {}", e).into());
            return Err(JsValue::from_str(&e));
        }
    };

    console::log_1(&"[WASM] extract_signing_share: success".into());

    JsValue::from_serde(&signing_share.to_vec()).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Split a 32-byte secret into shares using Shamir's Secret Sharing.
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

    let points =
        sss_split_inner(secret_arr, point_xs_arr, threshold).map_err(|e| JsValue::from_str(&e))?;

    let serializable_points: Vec<PointSerde> = points
        .into_iter()
        .map(|p| PointSerde { x: p.x, y: p.y })
        .collect();

    JsValue::from_serde(&serializable_points).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Combine shares to recover the original 32-byte secret.
#[wasm_bindgen]
pub fn sss_combine(points: JsValue, threshold: u32) -> Result<JsValue, JsValue> {
    let points_serde: Vec<PointSerde> = points
        .into_serde()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let points: Vec<Point256> = points_serde
        .into_iter()
        .map(|p| Point256 { x: p.x, y: p.y })
        .collect();

    let secret = sss_combine_inner(points, threshold).map_err(|e| JsValue::from_str(&e))?;

    JsValue::from_serde(&secret.to_vec()).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Reconstruct a KeyPackage from a signing_share and public information.
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

    let key_package = reconstruct_key_package_inner(
        signing_share_arr,
        &public_key_package_bytes,
        &identifier_bytes,
    )
    .map_err(|e| JsValue::from_str(&e))?;

    JsValue::from_serde(&key_package).map_err(|e| JsValue::from_str(&e.to_string()))
}
