import React, { PropsWithChildren, useEffect } from "react";
import { Button, Icon } from "react-bulma-components";
import dfinitylogo from "../../../assets/dfinity.svg";
import infinityswap from "../../../assets/infinityswap.png";
import pluglogo from "../../../assets/plug.png";
import stoiclogo from "../../../assets/stoic.png";
import { useProviders, useConnect } from "@connect2icmodclub/react";

/*
 * The sign-in process for when a user has not yet authenticated with the
 * Internet Identity Service.
 */
export function SignIn() {
  const { connect } = useConnect({
    onConnect: (provider) => {
      // Signed in

      console.log("on connect:", provider);
    },
    onDisconnect: () => {
      // Signed out
    },
  });
  const providers = useProviders();
  return (
    <>
      {providers.map((provider) => {
        return (
          <Button
            key={provider.meta.id}
            fullwidth
            color="gradient"
            className="is-outlined mb-4"
            onClick={() => connect(provider.meta.id)}
          >
            <span className="mr-2">Login</span>
            <Icon>
              <img src={provider.meta.icon.dark} alt="logo" />
            </Icon>
          </Button>
        );
      })}
    </>
  );
}
