use cait_sith_keplr::tecdsa_cli_srv::srv_triples::{TriplesServer, TriplesServer2};
use cait_sith_keplr::triples::{RcvdTriplesMessages, TriplesState};
use cait_sith_keplr::Secp256k1;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_triples_server_step_1() -> Result<serde_json::Value> {
    let output = TriplesServer::triples_step_1();

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_1() -> Result<serde_json::Value> {
    let output = TriplesServer2::triples_step_1().map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_2(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_2(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_3(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_3(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_4(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_4(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_5(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_5(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_6(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_6(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_7(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_1): {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (msgs_1): {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_7(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_8(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error (st_1): {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error (msgs_1): {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_8(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_9(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_9(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_10(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_10(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}

#[napi]
pub fn napi_run_triples_2_server_step_11(
    st_1_json: serde_json::Value,
    msgs_1_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_1: TriplesState<Secp256k1> = serde_json::from_value(st_1_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_1: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_1_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesServer2::triples_step_11(st_1, msgs_1).map_err(|err| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", err),
        )
    })?;

    serde_json::to_value(&output).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("serialization error: {:?}", e),
        )
    })
}
