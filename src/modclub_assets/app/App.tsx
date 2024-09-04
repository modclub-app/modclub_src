import * as React from "react";
import { useEffect } from "react";
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

  return (
    <StateProvider>
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
    </StateProvider>
  );
}
