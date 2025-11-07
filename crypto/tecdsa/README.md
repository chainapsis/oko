# Multi Party Computation - Proof of Concept

Focused on threshold elliptic curve digital signature scheme (ECDSA).

- paper/docs: https://cronokirby.com/notes/2023/04/cait-sith-security/
- client: https://github.com/LIT-Protocol/js-sdk/blob/master/packages/crypto/src/lib/crypto.ts
- cait-sith protocol: https://github.com/LIT-Protocol/cait-sith.git
- cait-sith docs: https://docs.rs/cait-sith/latest/cait_sith/index.html

## Test

```
./cargo_test ${rust_test_fn_name}
```

e.g.,

```
./cargo_test test_sign
```

or

```
./cargo_test test_e2e
```

## Client

### Install dependencies

```
yarn install
```

### Build Wasm

At client_example/wasm

```
yarn build:wasm
```

### Run(dev)

```
yarn dev
```

## Server

At server_example/addon

### Install dependencies

```
yarn install
```

### Build addon (napi)

```
yarn build
```

### Run server

```
yarn start
```
