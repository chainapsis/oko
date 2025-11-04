import React, { useState } from "react";
import { Widget } from "../widget_components";
import styles from "./login_widget.module.scss";
import { LoginDefaultView } from "./login_default_view";
import { LoginSocialsView } from "./login_socials_view";

export interface LoginWidgetProps {
  onSignIn: (
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) => void;
}

export const LoginWidget: React.FC<LoginWidgetProps> = ({ onSignIn }) => {
  const [showSocials, setShowSocials] = useState(false);

  return (
    <Widget>
      <div className={styles.container}>
        {!showSocials ? (
          <LoginDefaultView
            onSignIn={(m) => onSignIn(m)}
            onShowSocials={() => setShowSocials(true)}
          />
        ) : (
          <LoginSocialsView
            onBack={() => setShowSocials(false)}
            onSignIn={(m) => onSignIn(m)}
          />
        )}
      </div>
    </Widget>
  );
};
