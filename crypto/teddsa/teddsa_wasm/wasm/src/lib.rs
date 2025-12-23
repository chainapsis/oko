mod keygen;
mod sign;
mod sss;

use std::sync::Once;
use wasm_bindgen::prelude::*;

pub use keygen::*;
pub use sign::*;
pub use sss::*;

static INIT: Once = Once::new();

#[wasm_bindgen(start)]
pub fn init() {
    INIT.call_once(|| {
        // Always enable panic hook for better error messages
        console_error_panic_hook::set_once();
    });
}
