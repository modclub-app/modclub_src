import React, { PropsWithChildren, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import dfinitylogo from "../../../assets/dfinity.svg"

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn(props: PropsWithChildren<{}>) {
  console.log("SignIn component!");

  const { logIn, isAuthenticated, user } = useAuth();
  const history = useHistory();
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

    if (isAuthenticated && !user) {
      // If the user is authenticated but the user is not in the database,
      history.push("/signup");
    } else {
      history.push("/app");
    }

  };

  return (
    <button onClick={handleLogin} id="sign-in"
      className="button is-large extra mt-6">
        Login <img src={dfinitylogo} alt="dfinity logo"  style={{ width: "33px", marginRight: "-1em", marginLeft: "0.7em" }} />
      </button>
  );
}
