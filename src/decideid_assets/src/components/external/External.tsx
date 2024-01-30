import * as React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import NewProfile from "../auth/new_profile/NewProfile";
import Logout from "../auth/Logout";

export default function External() {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/logout" component={Logout} />
        <Route path="/signup" component={NewProfile} />
      </Switch>
    </>
  );
}
