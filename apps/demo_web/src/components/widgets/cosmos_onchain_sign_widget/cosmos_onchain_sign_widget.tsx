import React, { useCallback, useEffect, useState } from "react";
import { makeSignDoc as makeProtoSignDoc } from "@cosmjs/proto-signing";
import { makeSignDoc as makeAminoSignDoc } from "@cosmjs/amino";
import {
  AuthInfo,
  Fee,
  TxBody,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { CosmosIcon } from "@oko-wallet/ewallet-common-ui/icons/cosmos_icon";
import { Checkbox } from "@oko-wallet/ewallet-common-ui/checkbox";

import styles from "./cosmos_onchain_sign_widget.module.scss";
import { SignWidget } from "@oko-wallet-demo-web/components/widgets/sign_widget/sign_widget";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";

const COSMOS_CHAIN_ID = "cosmoshub-4";
const TOKEN_MINIMAL_DENOM = "uatom";

export const CosmosOnchainSignWidget = () => {
  const cosmosSDK = useSDKState((state) => state.keplr_sdk_cosmos);
  const [isSignAmino, setIsSignAmino] = useState(false);

  const handleClickCosmosSignDirect = useCallback(async () => {
    console.log("handleClickCosmosSignDirect()");

    if (cosmosSDK === null) {
      throw new Error("CosmosEWallet is not initialized");
    }

    const account = await cosmosSDK.getKey(COSMOS_CHAIN_ID);
    const address = account?.bech32Address;

    if (!address) {
      throw new Error("Address is not found");
    }

    const bodyBytes = TxBody.encode(
      TxBody.fromPartial<{}>({
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: MsgSend.encode({
              fromAddress: address,
              toAddress: address,
              amount: [
                {
                  denom: TOKEN_MINIMAL_DENOM,
                  amount: "10",
                },
              ],
            }).finish(),
          },
        ],
        memo: "",
      }),
    ).finish();

    const authInfoBytes = AuthInfo.encode({
      signerInfos: [
        {
          publicKey: {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PubKey.encode({
              key: account.pubKey,
            }).finish(),
          },
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_DIRECT,
            },
            multi: undefined,
          },
          sequence: "0",
        },
      ],
      fee: Fee.fromPartial<{}>({
        amount: [
          {
            denom: TOKEN_MINIMAL_DENOM,
            amount: "1000",
          },
        ],
        gasLimit: "200000",
      }),
    }).finish();

    const mockSignDoc = makeProtoSignDoc(
      bodyBytes,
      authInfoBytes,
      COSMOS_CHAIN_ID,
      1288582,
    );

    const result = await cosmosSDK.signDirect(
      COSMOS_CHAIN_ID,
      address,
      mockSignDoc,
    );
    console.info("SignDirect result:", result);
  }, [cosmosSDK]);

  const handleClickCosmosSignAmino = useCallback(async () => {
    console.info("handleClickCosmosSignAmino()");
    if (cosmosSDK === null) {
      throw new Error("CosmosEWallet is not initialized");
    }

    const account = await cosmosSDK.getKey(COSMOS_CHAIN_ID);
    const address = account?.bech32Address;

    if (!address) {
      throw new Error("Address is not found");
    }

    const stdFee = {
      amount: [
        {
          denom: TOKEN_MINIMAL_DENOM,
          amount: "1000",
        },
      ],
      gas: "200000",
    };
    const memo = "";
    const msgs = [
      {
        type: "cosmos-sdk/MsgSend",
        value: {
          from_address: address,
          to_address: address,
          amount: [
            {
              denom: TOKEN_MINIMAL_DENOM,
              amount: "10",
            },
          ],
        },
      },
    ];
    const accountNumber = 1288582;
    const sequence = 0;

    const mockSignDoc = makeAminoSignDoc(
      msgs,
      stdFee,
      COSMOS_CHAIN_ID,
      memo,
      accountNumber,
      sequence,
    );

    const result = await cosmosSDK.signAmino(
      COSMOS_CHAIN_ID,
      address,
      mockSignDoc,
    );

    console.info("SignAmino result:", result);
  }, [cosmosSDK]);

  return (
    <SignWidget
      chain="Cosmos Hub"
      chainIcon={<CosmosIcon />}
      signType="onchain"
      signButtonOnClick={
        isSignAmino ? handleClickCosmosSignAmino : handleClickCosmosSignDirect
      }
      renderBottom={() => (
        <div className={styles.checkboxContainer}>
          <Checkbox
            size="sm"
            id="set-sign-mode"
            checked={isSignAmino}
            onChange={() => setIsSignAmino((prevState) => !prevState)}
            label="Legacy JSON (Amino)"
          />
        </div>
      )}
    />
  );
};
