import { Navigation } from "../navigation/navigation";
import { SideBarFooter } from "./side_bar_footer";
import { SideBarHeader } from "./side_bar_header";

import styles from "./side_bar.module.scss";

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
