"use client";

import { FC } from "react";
import cn from "classnames";
import { CommandBlock } from "@oko-wallet/ewallet-common-ui/command_block";
import { Toggle } from "@oko-wallet/ewallet-common-ui/toggle";
import { Typography } from "@oko-wallet/ewallet-common-ui/typography";

import { FRAMEWORKS, AVAILABLE_NETWORKS, EVM_CLIENT_LIBS } from "./configs";
import { generateInstallCommand } from "./generate_install_command";
import { useSDKConfiguration } from "./use_sdk_configuration";
import { ConfigSection } from "./config_section";
import styles from "./sdk_installation_guide.module.scss";

export const SDKInstallationGuide: FC = () => {
  const {
    config,
    toggleNetwork,
    setFramework,
    setEvmClientLib,
    setIsWagmiWrapped,
  } = useSDKConfiguration();

  const installCommand = generateInstallCommand(config);
  const isEthSelected = config.networks.some((n) => n.name === "Ethereum");

  const renderEVMAddon = (addon: (typeof EVM_CLIENT_LIBS)[number]["addon"]) => {
    if (addon?.type === "toggle" && addon.key === "useWagmi") {
      return (
        <Toggle
          key={addon.key}
          label={addon.label}
          checked={config.isWagmiWrapped}
          onChange={setIsWagmiWrapped}
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <Typography
          tagType="h1"
          size="display-sm"
          weight="semibold"
          color="primary"
          className={styles.title}
        >
          Install Oko SDK
        </Typography>

        <Typography
          size="md"
          weight="medium"
          color="tertiary"
          className={styles.description}
        >
          Set up your environment, then get started with the code below
        </Typography>
      </div>

      <div className={styles.configs}>
        <ConfigSection label="Framework">
          {FRAMEWORKS.map((framework) => (
            <button
              key={framework.name}
              className={styles.option}
              onClick={() => setFramework(framework)}
            >
              <Typography size="md" weight="medium" color="brand-secondary">
                {framework.name}
              </Typography>
            </button>
          ))}
        </ConfigSection>

        <ConfigSection label="Network">
          {AVAILABLE_NETWORKS.map((network) => {
            const isSelected = config.networks.some(
              (n) => n.name === network.name,
            );
            return (
              <button
                key={network.name}
                className={styles.networkOption}
                onClick={() => toggleNetwork(network)}
              >
                <span
                  className={cn(styles.networkIcon, {
                    [styles.selected]: isSelected,
                  })}
                >
                  <network.Icon width={32} height={32} />
                </span>
                <Typography size="sm" weight="medium" color="secondary">
                  {network.name}
                </Typography>
              </button>
            );
          })}
        </ConfigSection>

        {isEthSelected && (
          <ConfigSection label="EVM Client Library">
            {EVM_CLIENT_LIBS.map((evmClientLib) => (
              <div key={evmClientLib.name} className={styles.optionWrapper}>
                <button
                  className={styles.option}
                  onClick={() => setEvmClientLib(evmClientLib)}
                >
                  <Typography size="md" weight="medium" color="brand-secondary">
                    {evmClientLib.name}
                  </Typography>
                </button>
                {renderEVMAddon(evmClientLib.addon)}
              </div>
            ))}
          </ConfigSection>
        )}
      </div>

      <CommandBlock command={installCommand} />
    </div>
  );
};
