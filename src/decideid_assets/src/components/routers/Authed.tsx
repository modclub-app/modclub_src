import * as React from "react";
import { Route, Switch } from "react-router-dom";
import NewProfile from "../auth/new_profile/NewProfile";
import Logout from "../auth/Logout";
import Main from "../app/Main";
import { useConnect } from "@connect2icmodclub/react";
import NotAuthenticatedModal from "../app/modals/NotAuthenticated"
import { useActors } from "../../utils";

export default function Authed() {
  const { isConnected, isInitializing } = useConnect();
  const {decideid} = useActors();
  if (isInitializing) {
    return <p>Spinning... Init connect2IC.</p>;
  }
  if (!isConnected)
    return  <NotAuthenticatedModal />

  if (!decideid) {
    return <p>Spinning... Init actors</p>;
  }

  return (
    <>
      <Switch>
        <Route path="/app" component={Main} />
        <Route path="/logout" component={Logout} />
        <Route path="/signup" component={NewProfile} /> 
      </Switch>
    </>
  );
}
