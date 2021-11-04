import React, { useCallback, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import dfinityLogo from "../assets/dfinity.svg";

// Note: This is just a basic example to get you started
function Auth() {
  const [signedIn, setSignedIn] = useState(false);
  const [_principal, setPrincipal] = useState("");
  const [_client, setClient] = useState(null);

  const initAuth = async () => {
    const client = await AuthClient.create();
    const isAuthenticated = await client.isAuthenticated();

    setClient(client);

    if (isAuthenticated) {
      const identity = client.getIdentity();
      const principal = identity.getPrincipal().toString();
      setSignedIn(true);
      setPrincipal(principal);
    }
  };

  const signIn = async () => {
    const { identity, principal } = await new Promise((resolve, reject) => {
      _client.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          const i = _client.getIdentity();
          const p = identity.getPrincipal().toString();
          resolve({ identity: i, principal: p });
        },
        onError: reject,
      });
    });
    setSignedIn(true);
    setPrincipal(principal);
  };

  const signOut = async () => {
    await _client.logout();
    setSignedIn(false);
    setPrincipal("");
  };

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div className="auth-section">
      {!signedIn && _client ? (
        <button onClick={signIn} className="auth-button">
          Sign in
          <img
            style={{ width: "33px", marginRight: "-1em", marginLeft: "0.7em" }}
            src={dfinityLogo}
          />
        </button>
      ) : null}

      {signedIn ? (
        <>
          <p>Signed in as: {_principal}</p>
          <button onClick={signOut} className="auth-button">
            Sign out
          </button>
        </>
      ) : null}
    </div>
  );
}

export { Auth };
