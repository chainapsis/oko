import React, { useState } from "react";
import { AuthProgressWidget } from "./auth_progress_widget";
import { AccountInfoWidget } from "./account_info_widget";
import { LoginWidget } from "../login_widget/login_widget";
import type { LoginMethod } from "@oko-wallet-demo-web/types/login";

export const AccountWidget: React.FC<AccountWidgetProps> = () => {
  // SDK related logic removed for maintenance mode / build fix
  // Just rendering the UI shell

  const handleSignIn = async (method: LoginMethod) => {
    console.log("Sign in disabled (Maintenance Mode)");
  };

  return <LoginWidget onSignIn={handleSignIn} />;
};

export interface AccountWidgetProps { }
