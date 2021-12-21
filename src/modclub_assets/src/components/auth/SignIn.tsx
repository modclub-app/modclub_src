import React, { PropsWithChildren, useEffect } from "react";
import { useAuth } from "../../utils/auth";
import { Button, Icon } from "react-bulma-components";
import dfinitylogo from "../../../assets/dfinity.svg"

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn(props: PropsWithChildren<{}>) {
  const { logIn, isAuthenticated, user } = useAuth();
  // If the auth provider has a user (which could be from local storage) and
  // the user is properly authenticated with the identity provider service then
  // send the user to their feed, as they are correctly signed in.


  // Initiates the login flow with the identity provider service, sending the
  // user to a new tab
  const handleLogin = async () => {
    console.log("handleLogin isAuthenticated", isAuthenticated);
    console.log("handleLogin user", user);

    if (!isAuthenticated) {
      await logIn();
    }
  };

  return (
    <Button onClick={handleLogin} fullwidth className="is-gradient is-outlined mb-4">
      <span className="mr-2">Login</span>
      <Icon>
        <img src={dfinitylogo} alt="dfinity logo" />
      </Icon>
    </Button>
  );
}
