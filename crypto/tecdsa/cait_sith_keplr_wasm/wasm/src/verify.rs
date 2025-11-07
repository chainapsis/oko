use cait_sith_keplr::{compat, FullSignature};
use ecdsa::Signature;
use gloo_utils::format::JsValueSerdeExt;
use k256::ecdsa::signature::Verifier;
use k256::ecdsa::VerifyingKey;
use k256::elliptic_curve::AffinePoint;
use k256::{PublicKey, Secp256k1};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn verify_sig(
    full_sig: JsValue,   // Signature,
    public_key: JsValue, // AffinePoint<Secp256k1>,
    msg: String,         // message string
) -> Result<JsValue, JsValue> {
    let full_sig: FullSignature<Secp256k1> = full_sig
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (full_sig): {:?}", e)))?;

    let sig: Signature<Secp256k1> = Signature::from_scalars(
        compat::x_coordinate::<Secp256k1>(&full_sig.big_r),
        full_sig.s,
    )
    .map_err(|e| JsValue::from_str(&format!("sig conversion fail, err: {:?}", e)))?;

    let public_key: AffinePoint<Secp256k1> = public_key
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (public_key): {:?}", e)))?;

    let out: bool = VerifyingKey::from(&PublicKey::from_affine(public_key).unwrap())
        .verify(msg.as_bytes(), &sig)
        .map_err(|err| JsValue::from_str(&format!("Error verifying the sig, err: {:?}", err)))
        .is_ok();

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[wasm_bindgen]
pub fn verify_sig_2(
    full_sig: JsValue,   // Signature,
    public_key: JsValue, // AffinePoint<Secp256k1>,
    msg: &[u8],          // message byte array
) -> Result<JsValue, JsValue> {
    let full_sig: FullSignature<Secp256k1> = full_sig
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (full_sig): {:?}", e)))?;

    let sig: Signature<Secp256k1> = Signature::from_scalars(
        compat::x_coordinate::<Secp256k1>(&full_sig.big_r),
        full_sig.s,
    )
    .map_err(|e| JsValue::from_str(&format!("sig conversion fail, err: {:?}", e)))?;

    let public_key: AffinePoint<Secp256k1> = public_key
        .into_serde()
        .map_err(|e| JsValue::from_str(&format!("deserialization error (public_key): {:?}", e)))?;

    let out: bool = VerifyingKey::from(&PublicKey::from_affine(public_key).unwrap())
        .verify(msg, &sig)
        .map_err(|err| JsValue::from_str(&format!("Error verifying the sig, err: {:?}", err)))
        .is_ok();

    JsValue::from_serde(&out).map_err(|err| JsValue::from_str(&err.to_string()))
}
