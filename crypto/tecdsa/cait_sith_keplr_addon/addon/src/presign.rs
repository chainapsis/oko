use cait_sith_keplr::presign::{PresignState2, RcvdPresignMessages2};
use cait_sith_keplr::tecdsa_cli_srv::cli_presign::PresignClient;
use cait_sith_keplr::tecdsa_cli_srv::srv_presign::PresignServer;
use cait_sith_keplr::triples::{TriplePub, TripleShare};
use cait_sith_keplr::KeygenOutput;
use cait_sith_keplr::Secp256k1;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_presign_client_step_1(
    pub_0_json: serde_json::Value,
    pub_1_json: serde_json::Value,
    share_0_0_json: serde_json::Value,
    share_0_1_json: serde_json::Value,
    keygen_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let pub_0: TriplePub<Secp256k1> = serde_json::from_value(pub_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (pub_0): {:?}", e),
        )
    })?;

    let pub_1: TriplePub<Secp256k1> = serde_json::from_value(pub_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (pub_1): {:?}", e),
        )
    })?;

    let share_0_0: TripleShare<Secp256k1> =
        serde_json::from_value(share_0_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (share_0_0): {:?}", e),
            )
        })?;

    let share_0_1: TripleShare<Secp256k1> =
        serde_json::from_value(share_0_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (share_0_1): {:?}", e),
            )
        })?;

    let keygen_0: KeygenOutput<Secp256k1> = serde_json::from_value(keygen_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (keygen_0): {:?}", e),
        )
    })?;

    let output = PresignClient::presign_step_1(pub_0, pub_1, share_0_0, share_0_1, keygen_0)
        .map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("presign error: {:?}", e),
            )
        })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_presign_client_step_2(st_0_json: serde_json::Value) -> Result<serde_json::Value> {
    let st_0: PresignState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_0): {:?}", e),
        )
    })?;

    let output = PresignClient::presign_step_2(st_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("presign error (step 2): {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error (step 2): {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_presign_client_step_3(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: PresignState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_0): {:?}", e),
        )
    })?;

    let msgs_0: RcvdPresignMessages2<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (msgs_0): {:?}", e),
            )
        })?;

    let output = PresignClient::presign_step_3(st_0, &msgs_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("presign error (step 3): {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error (step 3): {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_presign_server_step_1(
    pub_0_json: serde_json::Value,
    pub_1_json: serde_json::Value,
    share_0_1_json: serde_json::Value,
    share_1_1_json: serde_json::Value,
    keygen_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let pub_0: TriplePub<Secp256k1> = serde_json::from_value(pub_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (pub_0): {:?}", e),
        )
    })?;

    let pub_1: TriplePub<Secp256k1> = serde_json::from_value(pub_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (pub_1): {:?}", e),
        )
    })?;

    let share_0_1: TripleShare<Secp256k1> =
        serde_json::from_value(share_0_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (share_0_0): {:?}", e),
            )
        })?;

    let share_1_1: TripleShare<Secp256k1> =
        serde_json::from_value(share_1_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (share_0_1): {:?}", e),
            )
        })?;

    let keygen_1: KeygenOutput<Secp256k1> = serde_json::from_value(keygen_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (keygen_1): {:?}", e),
        )
    })?;

    let output = PresignServer::presign_step_1(pub_0, pub_1, share_0_1, share_1_1, keygen_1)
        .map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("presign error: {:?}", e),
            )
        })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_presign_server_step_2(st_1_json: serde_json::Value) -> Result<serde_json::Value> {
    let st_1: PresignState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_1): {:?}", e),
        )
    })?;

    let output = PresignServer::presign_step_2(st_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("presign error (server step_2): {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_presign_server_step_3(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: PresignState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_1): {:?}", e),
        )
    })?;

    let msgs_1: RcvdPresignMessages2<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (msgs_1): {:?}", e),
            )
        })?;

    let output = PresignServer::presign_step_3(st_1, &msgs_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("presign error (server step_3): {:?}", e),
        )
    })?;

    serde_json::to_value(output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}
