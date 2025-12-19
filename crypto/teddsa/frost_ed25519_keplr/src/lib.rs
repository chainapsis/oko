#![no_std]
#![allow(non_snake_case)]
#![deny(missing_docs)]
#![cfg_attr(docsrs, feature(doc_auto_cfg))]
#![cfg_attr(docsrs, feature(doc_cfg))]
#![doc = include_str!("../README.md")]
#![doc = document_features::document_features!()]

extern crate alloc;

#[cfg(test)]
mod tests;

mod point;
mod sss;
mod tss;

// Re-exports in our public API
#[cfg(feature = "serde")]
pub use frost_core::serde;
pub use point::*;
pub use rand_core;
pub use sss::*;
pub use tss::*;
