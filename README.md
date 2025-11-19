# Oko

[![Oko Wallet](https://oko-wallet.s3.ap-northeast-2.amazonaws.com/assets/oko-github-readme.png)](https://demo.oko.app)

Crypto wallet seamlessly built in your apps.

Using the latest advances in cryptography, Oko delivers a seamless experience by
integrating the security of blockchain wallets directly into web or mobile apps.

- 🔒**Enhanced Security**: Multi-party computation to generate signature
- 🚀 **Better User Experience**: No browser extension, no secret phrases, sign
  in with a social account.
- ⚡**Developer Friendly**: Simple integration, wallet programmability

[Explore the docs »](https://docs.oko.app)

[View Demo](https://demo.oko.app)

## Oko SDK

| Packages                                         | Latest                                                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [@oko-wallet/oko-sdk-core](sdk/oko_sdk_core)     | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-core.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-core)     |
| [@oko-wallet/oko-sdk-cosmos](sdk/oko_sdk_cosmos) | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-cosmos.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-cosmos) |
| [@oko-wallet/oko-sdk-eth](sdk/oko_sdk_eth)       | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-eth.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-eth)       |

## How it works

TBD

## Running a key share node

Please refer to the
[document](https://github.com/chainapsis/oko/blob/main/documentation/key_share_node.md).

## Contributing

Any contributions you make are greatly appreciated. If you have a suggestion can
improve this project, please do not hesitate to open an issue ticket or raise a
pull request.
[Guidelines](https://github.com/chainapsis/oko/blob/main/CONTRIBUTING.md) are
provided.

## Security

Please see [SECURITY.md](SECURITY.md) for our security policy and how to
report vulnerabilities.

## License

Distributed under the Apache License 2.0. See
[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) for more
information.

## Development

### Prerequisites

- Postgres 17+

#### pg_dump

During development, key share node assumes the system has "pg_dump" executable.
pg_dump should be installed while installing Postgres. One way to install on
MacOS is as follows.

```sh
brew install postgresql@18
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
