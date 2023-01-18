import * as React from "react";
import Header from "../header/Header";
import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import NewProfile from "../auth/new_profile/NewProfile";
import NewPohProfile from "../auth/poh/NewPohProfile";
import Airdrop from "./Airdrop";
import AdminIdentity from "./AdminIdentity";
import Privacy from "./Privacy";
import Terms from "./Terms";
import HowTo from "./HowTo";

export default function External() {
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/signup" component={NewProfile} />
        <Route path="/new-poh-profile" component={NewPohProfile} />
        <Route path="/airdrop" component={Airdrop} />
        <Route path="/admin-identity" component={AdminIdentity} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/how-to" component={HowTo} />
      </Switch>
    </>
  );
}
