import * as React from "react";
import Header from "../header/Header";
import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import NewProfile from "../auth/new_profile/NewProfile";
import NewPohProfile from "../auth/poh/NewPohProfile";
import AdminIdentity from "./AdminIdentity";
import Privacy from "./Privacy";
import Terms from "./Terms";
import HowTo from "./HowTo";
import Logout from "../auth/Logout";
import Airdrop from "./Airdrop/Airdrop";
import MigratedUsersAirdrop from "./migrated_users_airdrop/index";
import ProviderApp from "./provider/App";

export default function External() {
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/logout" component={Logout} />
        <Route path="/signup" component={NewProfile} />
        <Route path="/new-poh-profile" component={NewPohProfile} />
        <Route path="/admin-identity" component={AdminIdentity} />
        <Route path="/provider" component={ProviderApp} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/how-to" component={HowTo} />
        <Route path="/airdrop" component={Airdrop} />
        <Route
          path="/migrated-users-airdrop"
          component={MigratedUsersAirdrop}
        />
      </Switch>
    </>
  );
}
