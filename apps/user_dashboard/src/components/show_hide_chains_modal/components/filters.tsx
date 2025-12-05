import { FC, Fragment, ReactNode, useState } from "react";
import { Dropdown } from "@oko-wallet-common-ui/dropdown/dropdown";
import { ChevronDownIcon } from "@oko-wallet-common-ui/icons/chevron_down";
import { Typography } from "@oko-wallet-common-ui/typography/typography";

import styles from "./filters.module.scss";

const showHiddenChainsFilterOptions = ["Show All", "Enabled"] as const;
const ecosystemFilterOptions = ["All Chains", "Cosmos", "EVM"] as const;

type SelectedFilters = {
  showHiddenChains: (typeof showHiddenChainsFilterOptions)[number];
  ecosystem: (typeof ecosystemFilterOptions)[number];
};

export type ShowHideChainsFiltersProps = {
  children: (props: SelectedFilters) => ReactNode;
};

export const ShowHideChainsFilters: FC<ShowHideChainsFiltersProps> = ({
  children,
}) => {
  const [showHiddenChains, setShowHiddenChains] = useState<
    SelectedFilters["showHiddenChains"]
  >(showHiddenChainsFilterOptions[0]);
  const [ecosystem, setEcosystem] = useState<SelectedFilters["ecosystem"]>(
    ecosystemFilterOptions[0],
  );

  return (
    <Fragment>
      <div className={styles.filterWrapper}>
        <FilterDropdown
          options={showHiddenChainsFilterOptions}
          value={showHiddenChains}
          onChange={setShowHiddenChains}
        />
        <FilterDropdown
          options={ecosystemFilterOptions}
          value={ecosystem}
          onChange={setEcosystem}
        />
      </div>

      {children({
        showHiddenChains,
        ecosystem,
      })}
    </Fragment>
  );
};

type FilterDropdownProps<
  T extends
    | typeof showHiddenChainsFilterOptions
    | typeof ecosystemFilterOptions,
> = {
  options: T;
  value: T[number];
  onChange: (value: T[number]) => void;
};

const FilterDropdown = <
  T extends
    | typeof showHiddenChainsFilterOptions
    | typeof ecosystemFilterOptions,
>({
  options,
  value,
  onChange,
}: FilterDropdownProps<T>) => {
  return (
    <Dropdown>
      <Dropdown.Trigger asChild>
        <div className={styles.dropdownTrigger}>
          <Typography size="sm" color="secondary" weight="semibold">
            {options.find((option) => option === value)}
          </Typography>
          <ChevronDownIcon
            color="var(--fg-quaternary)"
            size={20}
            className={styles.chevronIcon}
          />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content className={styles.dropdownContent}>
        {options.map((option) => (
          <Dropdown.Item key={option} onClick={() => onChange(option)}>
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
};
