---
title: Welcome to Oko!
slug: /
sidebar_position: 1
---

# Overview

Welcome to Oko! 👋

<div style={{textAlign: "center", margin: "1rem 0"}}>
    <img src="/img/oko-welcome.png" alt="Oko Welcome" style={{width: "100%", height: "auto", borderRadius: "8px"}} />
</div>

Web3 onboarding does not need to be complicated. Oko makes onboarding
to your application easy, fast, and secure. No wallet installs, no recovery
phrases, no friction.

Using the latest advances in cryptography, Oko delivers a seamless
experience by integrating the security of blockchain wallets directly into web
or mobile apps. Users can sign up with **familiar login methods** (email,
social, or SSO) while enjoying the benefits of true crypto ownership — secure
transactions, asset custody, and compatibility with decentralized applications —
all without the friction of **managing private keys or seed phrases**.

## 🚀 Live Demo

Experience Oko in action:

- **[Demo Application](https://demo.oko.app)** - Explore the Oko
  experience in a live demo

## Why Oko

One of the biggest challenges in crypto is managing wallets across multiple chains. Keplr (the team behind Oko) has solved this with **a browser extension** that empowers users to securely self-custody their assets and connect effortlessly to dApps across ecosystems.

However, onboarding remains one of the biggest barriers for users who are less
familiar with crypto. In Web3, the core advantage is that users bring their own
wallet to every application—unlike Web2, where accounts are tied to individual
platforms. But this Web3 model introduces two major challenges:

- Managing recovery phrases or private keys
- Installing browser extensions or mobile apps

Embedded wallets aim to remove these hurdles by providing a smoother entry
point. Yet, existing solutions sacrifice one of Web3’s defining strengths:
_interoperability across applications and blockchains_. They tend to create
isolated accounts for each application, essentially reverting to a Web2-style
model.

**Oko** solves this problem. It delivers seamless onboarding while
preserving true Web3 interoperability, allowing users to access multiple
applications with the same wallet address.

With secure architecture, intuitive UX, and native multichain support, Oko
empowers both developers and users to build, transact, and scale with
confidence.

### Key Advantages

**🔒 Enhanced Security**

- **No single private key** - cryptographically impossible for any one party to
  access funds
- **2-of-2 multi-party computation** - distributed key management with no single
  point of failure
- **Decentralized validator coordination** - user key requires coordination from
  validator set
- **Master key never reconstructed** - private key never revealed at any point

**🚀 Better User Experience**

- **No browser extensions** - embedded directly in your application
- **No recovery phrases** - users don't need to manage complex private keys
- **Google OAuth login** - familiar authentication flow
- **Cross-device compatibility** - works on mobile, desktop, any browser
- **Cross-application interoperability** - same wallet address across multiple
  Web3 apps

**⚡ Developer Benefits**

- **Standard ECDSA signatures** - compatible with all existing blockchain
  infrastructure
- **Multi-chain support** - Ethereum and Cosmos ecosystems
- **Simple integration** - drop-in replacement for existing wallet connections
- **Programmable wallet experience** - combine Web2 convenience with Web3
  security

## Features

**Supported Blockchains**

#### Ethereum & EVM Chains

- **Full EIP-1193 provider** - compatible with all Ethereum dApps
- **Viem integration** - type-safe transaction handling
- **Standard methods**: `personal_sign`, `eth_signTypedData_v4`,
  `eth_sendTransaction`
- **Chain switching** - seamless multi-network support

#### Cosmos Ecosystem

- **Native CosmJS compatibility** - works with existing Cosmos applications
- **Amino and Direct signing** - supports both transaction formats
- **Chain registry integration** - automatic chain discovery and configuration
- **IBC support** - cross-chain operations

**Social login support**

- Sign in with Google (OAuth)

**Global wallet across all dApps**

**Oko SDK**

A lightweight client-side SDK for wallet initialization and Google Login integration — fully compatible with React. It lets you embed Oko's MPC-based wallet directly into your app without requiring users to install additional wallet extensions.

## Getting Started

Ready to integrate Oko into your application?

### 🚀 **Quick Integration**

- **[Integration Guide](getting-started/integration-overview.md)** - Add to your
  dApp in minutes
- **[SDK Documentation](sdk-usage/sdk-overview.md)** - Ethereum and Cosmos
  examples
- **[Starter Templates](getting-started/starter-templates.md)** - Next.js
  example repositories

### 🏗️ **Understanding the System**

- **[Complete Lifecycle Guide](lifecycle.md)** - End-to-end user journey from
  signup to transaction
- **[Technical Overview](concepts/threshold-ecdsa.md)** - How threshold
  signatures work
- **[Architecture](architecture.md)** - System design and integration points

### 📚 **API Reference**

- **[Authentication](api-reference/api-overview.md#authentication)** - Google
  OAuth and session management
- **[Provider Methods](api-reference/api-overview.md)** - Complete API reference

---

**Let's get started! Ready to eliminate single points of failure in your
application? Start with the
[Integration Guide](getting-started/integration-overview.md).**
