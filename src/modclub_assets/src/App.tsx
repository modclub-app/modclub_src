import React from "react";
import './bulma.css'
import "./App.scss";

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
// import Home from "./components/external/Home";
import External from "./components/external/External";
import ModclubApp from "./components/app/ModclubApp";

export default function App() {
  return (
    <Router>
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/app">
          <ModclubApp />
        </Route>
        <Route path="/">
          <External />
        </Route>
      </Switch>
    </Router>
  );
}

