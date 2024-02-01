import * as React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './globals.css';

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById("app")
);
