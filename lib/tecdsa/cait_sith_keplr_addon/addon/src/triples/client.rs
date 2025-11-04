use cait_sith_keplr::tecdsa_cli_srv::cli_triples::TriplesClient;
use cait_sith_keplr::triples::{RcvdTriplesMessages, TriplesState};
use cait_sith_keplr::Secp256k1;
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn napi_run_triples_2_client_step_1() -> Result<serde_json::Value> {
    let output = TriplesClient::triples_step_1().map_err(|err| {
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
pub fn napi_run_triples_2_client_step_2(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_2(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_3(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_3(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_4(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_4(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_5(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_5(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_6(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_6(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_7(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_7(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_8(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_8(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_9(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_9(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_10(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_10(st_0, msgs_0).map_err(|err| {
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
pub fn napi_run_triples_2_client_step_11(
    st_0_json: serde_json::Value,
    msgs_0_json: serde_json::Value,
) -> Result<serde_json::Value> {
    let st_0: TriplesState<Secp256k1> = serde_json::from_value(st_0_json).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("deserialization error: {:?}", e),
        )
    })?;

    let msgs_0: RcvdTriplesMessages<Secp256k1> =
        serde_json::from_value(msgs_0_json).map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("deserialization error: {:?}", e),
            )
        })?;

    let output = TriplesClient::triples_step_11(st_0, msgs_0).map_err(|err| {
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
