use cait_sith_keplr::compat::scalar_hash;
use cait_sith_keplr::sign::{RcvdSignMessages, SignState2};
use cait_sith_keplr::tecdsa_cli_srv::cli_sign::SignClient;
use cait_sith_keplr::tecdsa_cli_srv::srv_sign::SignServer;
use cait_sith_keplr::PresignOutput;
use cait_sith_keplr::Secp256k1;
use elliptic_curve::scalar::FromUintUnchecked;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_sign_client_step_1(
    msg: String,
    presig_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let msg_hash = scalar_hash(msg.as_bytes());

    let presig_0: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_0): {:?}", e),
            )
        })?;

    let output = SignClient::sign_step_1(msg_hash.into(), presig_0).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_sign_client_step_1_v2(
    msg: &[u8],
    presig_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let msg_hash = k256::Scalar::from_uint_unchecked(k256::U256::from_be_slice(msg));

    let presig_0: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_0): {:?}", e),
            )
        })?;

    let output = SignClient::sign_step_1(msg_hash.into(), presig_0).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_sign_client_step_2(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
    presig_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let mut st_0: SignState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_0): {:?}", e),
        )
    })?;

    let msgs_0: RcvdSignMessages<Secp256k1> = serde_json::from_value(msgs_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (msgs_0): {:?}", e),
        )
    })?;

    let presig_0: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_0): {:?}", e),
            )
        })?;

    let output = SignClient::sign_step_2(&mut st_0, &msgs_0, presig_0).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_sign_server_step_1(
    msg: String,
    presig_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let msg_hash = scalar_hash(msg.as_bytes());

    let presig_1: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_1): {:?}", e),
            )
        })?;

    let output = SignServer::sign_step_1(msg_hash.into(), presig_1).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_sign_server_step_1_v2(
    msg: &[u8],
    presig_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let msg_hash = k256::Scalar::from_uint_unchecked(k256::U256::from_be_slice(msg));

    let presig_1: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_1): {:?}", e),
            )
        })?;

    let output = SignServer::sign_step_1(msg_hash.into(), presig_1).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_sign_server_step_2(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
    presig_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let mut st_1: SignState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_1): {:?}", e),
        )
    })?;

    let msgs_1: RcvdSignMessages<Secp256k1> = serde_json::from_value(msgs_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (msgs_1): {:?}", e),
        )
    })?;

    let presig_1: PresignOutput<Secp256k1> =
        serde_json::from_value(presig_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (presig_1): {:?}", e),
            )
        })?;

    let output = SignServer::sign_step_2(&mut st_1, &msgs_1, presig_1).map_err(|e| {
        napi::Error::new(napi::Status::GenericFailure, format!("sign error: {:?}", e))
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}
