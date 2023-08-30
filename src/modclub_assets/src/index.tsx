import * as React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthProvider } from "./contexts/auth";
import { ProfileProvider } from "./contexts/profile";
import { Connect2ICProvider } from "@connect2icmodclub/react";

import "./index.scss";

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("app")
);
