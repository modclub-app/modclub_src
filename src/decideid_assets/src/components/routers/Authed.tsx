import * as React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "../external/Home";
import NewProfile from "../auth/new_profile/NewProfile";
import Logout from "../auth/Logout";
import AuthApp from "../app/AuthApp";
import { AuthProvider } from "../../contexts/auth";
import { ProfileProvider } from "../..//contexts/profile";

export default function Authed() {
  return (
    <>
      <AuthProvider>
        <ProfileProvider>
          <Switch>
            <Route path="/app" component={AuthApp} />
            <Route path="/logout" component={Logout} />
            <Route path="/signup" component={NewProfile} /> 
          </Switch>
        </ProfileProvider>
      </AuthProvider>
    </>
  );
}
