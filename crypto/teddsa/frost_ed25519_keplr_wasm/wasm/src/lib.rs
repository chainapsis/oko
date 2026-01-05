mod keygen;
mod keys;
mod sign;
mod sss;

use std::sync::Once;
use wasm_bindgen::prelude::*;

pub use keygen::*;
pub use keys::*;
pub use sign::*;
pub use sss::*;

// Ensure initialization happens only once
static INIT: Once = Once::new();

// Module initialization function that runs automatically when the WASM module is loaded
#[wasm_bindgen(start)]
pub fn init() {
    INIT.call_once(|| {
        // Set up the panic hook for better error messages
        console_error_panic_hook::set_once();
    });
}
