import * as React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "../external/Home";


export default function External() {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
      </Switch>
    </>
  );
}
