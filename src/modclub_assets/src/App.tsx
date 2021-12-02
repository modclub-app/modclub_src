import React from "react";
import './bulma.css'
import "./App.scss";
import "./Responsive.scss";

import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";

import External from "./components/external/External";
import ModclubApp from "./components/app/ModclubApp";

export default function App() {
 const history = useHistory();
  return (
    <Router history={history}>
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/app" component={ModclubApp} />                  
        <Route path="/" component={External} />            
      </Switch>
    </Router>
  );
}

