import * as React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import { AuthProvider } from "./contexts/auth";
import { Connect2ICProvider } from "@connect2icmodclub/react";

import  { canistersClient } from "./canistersClient";

import "./index.scss";

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
  <React.StrictMode>
    <AuthProvider client={canistersClient}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
