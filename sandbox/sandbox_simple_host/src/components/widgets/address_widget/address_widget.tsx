import { useState, type FC } from "react";

import styles from "./address_widget.module.scss";
import { Widget } from "../widget_components";
import { ViewChainsButton } from "./view_chains_button";
import { ViewChainsModal } from "./view_chains_modal";

export const AddressWidget: FC<AddressWidgetProps> = ({}) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewChains = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Widget>
        <div className={styles.container}>
          <p>Wallet Address</p>
          <ViewChainsButton onClick={handleViewChains} />
        </div>
      </Widget>

      {showModal && <ViewChainsModal onClose={handleCloseModal} />}
    </>
  );
};

export interface AddressWidgetProps {}
