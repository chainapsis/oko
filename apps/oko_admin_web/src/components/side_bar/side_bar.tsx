

import styles from "./side_bar.module.scss";
import { SideBarHeader } from "./side_bar_header";
import { SideBarFooter } from "./side_bar_footer";
import { Navigation } from "../navigation/navigation";

export const SideBar = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <SideBarHeader>
          <Navigation />
        </SideBarHeader>
        <SideBarFooter />
      </div>
    </div>
  );
};
