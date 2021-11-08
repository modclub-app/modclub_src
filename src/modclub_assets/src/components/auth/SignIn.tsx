import React, { PropsWithChildren, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../utils/auth";

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn(props: PropsWithChildren<{}>) {
  const { children = "Authorize" } = props;
  const auth = useAuth();
  const history = useHistory();

  // If the auth provider has a user (which could be from local storage) and
  // the user is properly authenticated with the identity provider service then
  // send the user to their feed, as they are correctly signed in.
  useEffect(() => {
    console.log({ auth });
    console.log(auth.identity?.getPrincipal().toString())
    if (auth.user && !auth.identity?.getPrincipal().isAnonymous()) {
      history.replace("/feed");
    }
  }, [auth.identity, auth.user, history]);

  // Initiates the login flow with the identity provider service, sending the
  // user to a new tab
  const handleLogin = async () => {
    await auth.logIn();
    history.push("/sign-up");
  };

  return (
      <button onClick={handleLogin} id="sign-in" className="primary medium">
        Login
      </button>
  );
}
