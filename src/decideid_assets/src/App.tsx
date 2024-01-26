import * as React from "react";
import { useEffect } from "react";
import { Usergeek } from "usergeek-ic-js";
import "./bulma.css";
import "./App.scss";
import "./Responsive.scss";

import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";

import { StateProvider } from "./components/app/state_mgmt/provider";
import External from "./components/external/External";
import ModclubApp from "./components/app/ModclubApp";

import { ProfileProvider } from "./contexts/profile";

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
    <>
      <ProfileProvider>
        <Router history={history}>
          <Switch>
            <Route path="/app" component={ModclubApp} />
          </Switch>
        </Router>
      </ProfileProvider>
      <Router history={history}>
        <Switch>
          <Route path="/" component={External} />
        </Switch>
      </Router>
    </>
  );
}
