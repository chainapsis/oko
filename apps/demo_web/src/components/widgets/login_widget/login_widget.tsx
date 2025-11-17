import React, { useState } from "react";
import { Widget } from "../widget_components";
import styles from "./login_widget.module.scss";
import { LoginDefaultView } from "./login_default_view";
import { LoginSocialsView } from "./login_socials_view";

export type EmailLoginStage = "enter-email" | "sending-code" | "receive-code";

export interface EmailLoginState {
  stage: EmailLoginStage;
  email: string;
}

export interface LoginWidgetProps {
  onSignIn: (
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) => void;
  emailLoginState: EmailLoginState;
  onEmailChange: (email: string) => void;
  onVerifyEmailCode: (code: string) => void;
  emailStatusMessage?: string | null;
  emailErrorMessage?: string | null;
  isEmailVerificationInProgress?: boolean;
}

export const LoginWidget: React.FC<LoginWidgetProps> = ({
  onSignIn,
  emailLoginState,
  onEmailChange,
  onVerifyEmailCode,
  emailStatusMessage,
  emailErrorMessage,
  isEmailVerificationInProgress,
}) => {
  const [showSocials, setShowSocials] = useState(false);

  return (
    <Widget>
      <div className={styles.container}>
        {!showSocials ? (
          <LoginDefaultView
            onSignIn={(method, email) => onSignIn(method, email)}
            emailLoginState={emailLoginState}
            onEmailChange={onEmailChange}
            onShowSocials={() => setShowSocials(true)}
            onVerifyEmailCode={onVerifyEmailCode}
            statusMessage={emailStatusMessage}
            errorMessage={emailErrorMessage}
            isVerifyingCode={isEmailVerificationInProgress}
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
