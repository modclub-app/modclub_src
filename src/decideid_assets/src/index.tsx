import * as React from "react";
import ReactDOM from "react-dom";
import "./globals.css";
import AppContainer from "./AppContainer";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContainer />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("app")
);
