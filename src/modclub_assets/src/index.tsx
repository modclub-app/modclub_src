import React from "react";
import ReactDOM from 'react-dom';
import App from "./App";
import { ProvideAuth } from "./utils/auth";
import "./index.scss";

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 */
window.global = window;

ReactDOM.render(  
    <React.StrictMode>
        <ProvideAuth>
            <App />
        </ProvideAuth>
    </React.StrictMode>,
   document.getElementById("app")
);
