import React, { PropsWithChildren, useEffect } from "react";
import { useAuth } from "../../utils/auth";
import { Button, Icon } from "react-bulma-components";
import dfinitylogo from "../../../assets/dfinity.svg";
import pluglogo from "../../../assets/plug.png";
import stoiclogo from "../../../assets/stoic.png";

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
  const handleLogin = async (loginMethodToUse) => {
    /* console.log("handleLogin isAuthenticated", isAuthenticated);
    console.log("handleLogin user", user); */

    if (!isAuthenticated) {
      await logIn(loginMethodToUse);
    }
  };

  return (
    <>
      <Button fullwidth color="gradient" className="is-outlined mb-4" onClick={() => handleLogin('ii')} >
        <span className="mr-2">Login</span>
        <Icon>
          <img src={dfinitylogo} alt="dfinity logo" />
        </Icon>
      </Button>
      {/* <Button fullwidth color="gradient" className="is-outlined mb-4" onClick={() => handleLogin('plug')} >
        <span className="mr-2">Login</span>
        <Icon>
          <img src={pluglogo} alt="plug logo" />
        </Icon>
      </Button> */}
      <Button fullwidth color="gradient" className="is-outlined mb-4" onClick={() => handleLogin('stoic')} >
        <span className="mr-2">Login</span>
        <Icon>
          <img src={stoiclogo} alt="stoic logo" />
        </Icon>
      </Button>
    </>
  );
}
