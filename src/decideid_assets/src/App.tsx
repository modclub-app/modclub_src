import * as React from "react";
import Header from "./components/header/Header";

import {
  HashRouter as Router,
  useHistory,
} from "react-router-dom";

import External from "./components/routers/External";
import Authed from "./components/routers/Authed";

export default function App() {
  const history = useHistory();

  return (
    <Router history={history}>
      <Header />
          <Authed />
          <External />
    </Router>
  );
}
