import * as React from 'react';
import { useEffect } from 'react';
import { Usergeek } from "usergeek-ic-js";
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

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Usergeek.init({apiKey: "01EC01B48E8C9C81CAE9E94839D511FD"})
    } else {
      Usergeek.init({apiKey: "01EC01B48E8C9C81CAE9E94839D511FD", host: "https://ljyte-qiaaa-aaaah-qaiva-cai.raw.ic0.app"})
    }
  }, []);


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

