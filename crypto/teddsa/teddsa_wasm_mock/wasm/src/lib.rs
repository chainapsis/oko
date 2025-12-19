mod keygen;
mod sign;

use std::sync::Once;
use wasm_bindgen::prelude::*;

pub use keygen::*;
pub use sign::*;

// Ensure initialization happens only once
static INIT: Once = Once::new();

// Module initialization function that runs automatically when the WASM module is loaded
#[wasm_bindgen(start)]
pub fn init() {
    INIT.call_once(|| {
        #[cfg(debug_assertions)]
        console_error_panic_hook::set_once();
    });
}
