import * as React from "react";
import ReactDOM from "react-dom";
import './globals.css';
import AppContainer from "./AppContainer";

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

ReactDOM.render(
  <React.StrictMode>
      <AppContainer />
  </React.StrictMode>,
  document.getElementById("app")
);
