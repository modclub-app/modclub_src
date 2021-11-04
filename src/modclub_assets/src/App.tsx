import React from "react";
import "./App.scss";
import Header from "./components/header/Header";
import Landing from "./components/landing/Landing";
import { modclub } from "../../declarations/modclub";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Home from "./components/external/Home";
import NewProfile from "./components/humanity/new_profile/NewProfile";
import SubmitPhoto from "./components/humanity/photo/SubmitPhoto";


// Component for the outlined button
function ButtonOutlined(props) {
  return (
    <div className="signup">
      <input
        disabled={props.isLoading}
        type="email"
        id="email"
        name="email"
        placeholder="Enter your email..."
        className="textInput"
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      <button
        disabled={props.isLoading}
        type="submit"
        className="ButtonOutlined"
        onClick={async () => {
          props.setIsLoading(true);
          props.setResult(await modclub.addToWaitList(props.text));
        }}
      >
        {props.isLoading && (
          <i className="fa fa-refresh fa-spin" style={{ marginRight: "5px" }} />
        )}
        Join the Beta
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="about">
            <Home/>
          </Route>
          <Route path="/signup">
            <SubmitPhoto />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

