import { FC, ReactNode, useState } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Card } from "@oko-wallet-common-ui/card/card";
import { XCloseIcon } from "@oko-wallet-common-ui/icons/x_close";
import { Button } from "@oko-wallet-common-ui/button/button";
import { SearchIcon } from "@oko-wallet-common-ui/icons/search";

import styles from "./show_hide_chains_modal.module.scss";
import { Spacing } from "@oko-wallet-common-ui/spacing/spacing";

interface ShowHideChainsModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const ShowHideChainsModal: FC<ShowHideChainsModalProps> = ({
  renderTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {renderTrigger({ onOpen })}

      {isOpen && (
        <div className={styles.modalBackground} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Card
              className={styles.modalCard}
              variant="elevated"
              padding="none"
            >
              <div className={styles.modalContent}>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <XCloseIcon color="var(--fg-quaternary)" size={20} />
                </button>

                <div className={styles.searchBar}>
                  <SearchIcon color="var(--fg-quaternary)" size={16} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search Assets or Chains"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    name="search-assets-chains"
                  />
                </div>
              </div>

              <div>
                <Typography size="sm" weight="semibold" color="secondary">
                  Filters
                </Typography>
                {/* TODO: dropdowns */}
              </div>

              {/* TODO: chain list */}
              <Spacing height={24} />

              <Button variant="primary" size="lg" fullWidth>
                Save
              </Button>

              <Spacing height={8} />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};
