import React, { PropsWithChildren, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../utils/auth";

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn(props: PropsWithChildren<{}>) {
  const auth = useAuth();

  // If the auth provider has a user (which could be from local storage) and
  // the user is properly authenticated with the identity provider service then
  // send the user to their feed, as they are correctly signed in.


  // Initiates the login flow with the identity provider service, sending the
  // user to a new tab
  const handleLogin = async () => {
    await auth.logIn();
  };

  return (
      <button onClick={handleLogin} id="sign-in" className="primary medium">
        Login
      </button>
  );
}
