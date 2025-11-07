use cait_sith_keplr::compat::{self};
use cait_sith_keplr::tecdsa_cli_srv::verifier;
use cait_sith_keplr::{FullSignature, Secp256k1};
use ecdsa::Signature;
use elliptic_curve::AffinePoint;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_verify(
    full_sig: serde_json::Value,
    public_key: serde_json::Value,
    msg: String,
) -> Result<serde_json::Value> {
    let full_sig: FullSignature<Secp256k1> = serde_json::from_value(full_sig).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (sig): {:?}", e),
        )
    })?;

    let sig: Signature<Secp256k1> = Signature::from_scalars(
        compat::x_coordinate::<Secp256k1>(&full_sig.big_r),
        full_sig.s,
    )
    .map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sig conversaion error, err: {:?}", e),
        )
    })?;

    let public_key: AffinePoint<Secp256k1> = serde_json::from_value(public_key).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (public_key): {:?}", e),
        )
    })?;

    verifier::verify_sig(sig, public_key, msg.as_bytes()).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sig verification error: {:?}", e),
        )
    })?;

    Ok(serde_json::Value::from(true))
}

#[napi]
pub fn napi_run_verify_2(
    full_sig: serde_json::Value,
    public_key: serde_json::Value,
    msg: &[u8],
) -> Result<serde_json::Value> {
    let full_sig: FullSignature<Secp256k1> = serde_json::from_value(full_sig).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (sig): {:?}", e),
        )
    })?;

    let sig: Signature<Secp256k1> = Signature::from_scalars(
        compat::x_coordinate::<Secp256k1>(&full_sig.big_r),
        full_sig.s,
    )
    .map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sig conversaion error, err: {:?}", e),
        )
    })?;

    let public_key: AffinePoint<Secp256k1> = serde_json::from_value(public_key).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (public_key): {:?}", e),
        )
    })?;

    verifier::verify_sig(sig, public_key, msg).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("sig verification error: {:?}", e),
        )
    })?;

    Ok(serde_json::Value::from(true))
}
