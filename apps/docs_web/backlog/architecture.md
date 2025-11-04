## Architecture

At the core, Keplr Embedded uses a **2-of-2 multi-party computation signing
model**. It is a threshold ECDSA cryptocurrency wallet system implementing the
Cait-Sith protocol. The system distributes cryptographic keys across multiple
parties using committed Beaver triples for efficient preprocessing and threshold
signature generation.

**This means no single party ever has access to the complete master key.**

```
Traditional Wallet:  [Single Private Key] → Sign Transaction
```

```
Keplr Embedded:     [Keplr Key Share] + [User Key Share] → Sign Transaction
```

- **One key is managed by Keplr**
- **The user key is cryptographically protected** and requires coordination from
  a decentralized validator set to enable signing

**Note that at all points of the key generation or signing process, the master
key (or private key) is never reconstructed or revealed.** This ensures users
retain full control without compromising on security.

This also means users don't need to manage or back up complex private keys
themselves, making the experience safer and more accessible. By leveraging MPC
and eliminating single points of failure through decentralized key management,
Keplr significantly strengthens wallet safety for end users.
