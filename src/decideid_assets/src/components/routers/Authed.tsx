import * as React from "react";
import { Route, Switch } from "react-router-dom";
import NewProfile from "../auth/new_profile/NewProfile";
import Logout from "../auth/Logout";
import App from "../app/App";
import { AuthProvider } from "../../contexts/auth";
import { ProfileProvider } from "../..//contexts/profile";

export default function Authed() {
  return (
    <>
      <AuthProvider>
        <ProfileProvider>
          <Switch>
            <Route path="/app" component={App} />
            <Route path="/logout" component={Logout} />
            <Route path="/signup" component={NewProfile} /> 
          </Switch>
        </ProfileProvider>
      </AuthProvider>
    </>
  );
}
