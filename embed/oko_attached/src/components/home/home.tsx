"use client";

import type { FC } from "react";

import { Modal } from "@oko-wallet-attached/components/modal/modal";

import styles from "./home.module.scss";

export const Home: FC = () => {
  return (
    <div className={styles.wrapper}>
      <Modal />
    </div>
  );
};
