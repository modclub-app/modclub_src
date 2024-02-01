import * as React from "react";
import { useEffect } from "react";
import { Usergeek } from "usergeek-ic-js";
import Header from "./components/header/Header";

import {
  HashRouter as Router,
  useHistory,
} from "react-router-dom";

import External from "./components/routers/External";
import Authed from "./components/routers/Authed";

export default function App() {
  const history = useHistory();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Usergeek.init({ apiKey: "01C001B685B0F32CFCCEEBAA4C97E390" });
    } else {
      Usergeek.init({
        apiKey: "012701B7CC044FBD096F55C8DAA5413E",
        host: "https://ljyte-qiaaa-aaaah-qaiva-cai.ic0.app",
      });
    }
  }, []);

  return (
    <Router history={history}>
      <Header />
          <Authed />
          <External />
    </Router>
  );
}
