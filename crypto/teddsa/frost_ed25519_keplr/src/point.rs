//! Point types for SSS operations.

use curve25519_dalek::scalar::Scalar;

/// A 256-bit point with x and y coordinates.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Point256 {
    /// X coordinate (32 bytes)
    pub x: [u8; 32],
    /// Y coordinate (32 bytes)
    pub y: [u8; 32],
}

impl Point256 {
    /// Returns x coordinate as Scalar.
    pub fn x_scalar(&self) -> Scalar {
        Scalar::from_bytes_mod_order(self.x)
    }

    /// Returns y coordinate as Scalar.
    pub fn y_scalar(&self) -> Scalar {
        Scalar::from_bytes_mod_order(self.y)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_point256_scalars() {
        let mut point = Point256 {
            x: [0; 32],
            y: [0; 32],
        };
        point.y[0] = 1; // little-endian: 1

        assert_eq!(point.x_scalar(), Scalar::ZERO);
        assert_eq!(point.y_scalar(), Scalar::ONE);
    }
}
