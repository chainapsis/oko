import { x25519 } from "@noble/curves/ed25519.js";

// x25519
import { ed25519 } from "@noble/curves/ed25519.js";
const alice = ed25519.keygen();
const bob = ed25519.keygen();
const aliceSecX = ed25519.utils.toMontgomerySecret(alice.secretKey);
const bobPubX = ed25519.utils.toMontgomery(bob.publicKey);
const sharedKey = x25519.getSharedSecret(aliceSecX, bobPubX);
