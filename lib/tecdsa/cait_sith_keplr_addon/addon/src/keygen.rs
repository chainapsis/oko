use cait_sith_keplr::keyshare::{KeyshareState2, RcvdKeyshareMessages};
use cait_sith_keplr::tecdsa_cli_srv::cli_keygen::{KeyCombineInput, KeygenClient};
use cait_sith_keplr::tecdsa_cli_srv::srv_keygen::KeygenServer;
use cait_sith_keplr::Secp256k1;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_keygen_client_step_1() -> Result<serde_json::Value> {
    let output = KeygenClient::cli_keygen_step_1().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
        )
    })?;

    let result = serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })?;

    Ok(result)
}

#[napi]
pub fn napi_run_keygen_client_step_2(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: KeyshareState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenClient::cli_keygen_step_2(st_0, &msgs_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_client_step_3(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: KeyshareState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenClient::cli_keygen_step_3(st_0, &msgs_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_client_step_4(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: KeyshareState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenClient::cli_keygen_step_4(st_0, &msgs_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_client_step_5(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: KeyshareState2<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenClient::cli_keygen_step_5(st_0, &msgs_0).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_server_step_1() -> Result<serde_json::Value> {
    let output = KeygenServer::srv_keygen_step_1().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
        )
    })?;

    let result = serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })?;

    Ok(result)
}

#[napi]
pub fn napi_run_keygen_server_step_2(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: KeyshareState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenServer::srv_keygen_step_2(st_1, &msgs_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_server_step_3(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: KeyshareState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenServer::srv_keygen_step_3(st_1, &msgs_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_server_step_4(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: KeyshareState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenServer::srv_keygen_step_4(st_1, &msgs_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_server_step_5(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: KeyshareState2<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdKeyshareMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = KeygenServer::srv_keygen_step_5(st_1, &msgs_1).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
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
pub fn napi_run_keygen_client_centralized() -> Result<serde_json::Value> {
    let output = KeygenClient::cli_keygen_centralized().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("keygen error: {:?}", e),
        )
    })?;

    let result = serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })?;

    Ok(result)
}

#[napi]
pub fn napi_run_keygen_combine_shares(
    key_combine_input_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let input: KeyCombineInput<Secp256k1> = serde_json::from_value(key_combine_input_json)
        .map_err(|e| {
            napi::Error::new(
                napi::Status::InvalidArg,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let scalar = KeygenClient::cli_combine_shares(input).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("combine_shares failed: {e:?}"),
        )
    })?;

    serde_json::to_value(&scalar).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {e:?}"),
        )
    })
}
