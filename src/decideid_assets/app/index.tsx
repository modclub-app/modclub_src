import * as React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import "./globals.scss";
import AppContainer from "./AppContainer";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

const root = createRoot(document.getElementById("app")!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContainer />
    </QueryClientProvider>
  </React.StrictMode>
);
