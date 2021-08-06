import React from "react";
import { render } from "react-dom";
import "./index.scss";
import App from "./App";

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

render(<App />, document.getElementById("app"));
