import React, { useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { withDisabled } from "../../utils";

export const WithAuth = (props) => {
  const [authPrincipal, setAuthPrincipal] = useState(null);
  const [pending, setPending] = useState(false);
  const [iiUrl, setIiUrl] = useState<string>("http://localhost:5173");

  // Perform authentication with IDP and get Principal
  const authAndShow = () =>
    withDisabled(async () => {
      const authClient = await AuthClient.create();

      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: iiUrl,
          onSuccess: () => resolve(),
          onError: reject,
        });
      });

      setAuthPrincipal(authClient.getIdentity().getPrincipal().toText());
    }, setPending);

  return (
    <span>
      {!authPrincipal ? (
        <main data-page="auth">
          <h3>Auth</h3>
          <section>
            <label>
              Internet Identity URL:
              <input
                data-role="ii-url"
                type="text"
                value={iiUrl}
                onChange={(evt) => setIiUrl(evt.target.value)}
              />
            </label>
            <button
              data-action="authenticate"
              disabled={pending}
              onClick={() => authAndShow()}
            >
              Authenticate with II
            </button>
          </section>
        </main>
      ) : (
        <>
          <span>
            <section>
              <label>
                Principal:
                <output data-role="principal">{authPrincipal}</output>
              </label>
            </section>
          </span>
          {props.children}
        </>
      )}
    </span>
  );
};
