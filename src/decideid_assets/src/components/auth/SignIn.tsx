import React from "react";
import { useProviders, useConnect } from "@connect2icmodclub/react";

export function SignIn() {
  const { connect } = useConnect({
    onConnect: (provider) => {
      console.log("on connect:", provider);
    },
    onDisconnect: () => {
      // Signed out
    },
  });

  const providers = useProviders();

  return (
    <div className="flex flex-col items-center w-full"> {/* Parent container */}
      {providers.map((provider) => (
        <button
          key={provider.meta.id}
          className="bg-gradient-to-r from-blue-800 to-pink-400 text-white py-2 px-12 rounded mb-1 mx-auto outline-none focus:outline-none"
          onClick={() => connect(provider.meta.id)}
        >
          <span className="mr-2">Login</span>
          <span className="inline-block align-middle">
            <img src={provider.meta.icon.dark} alt="logo" className="h-5 w-5" />
          </span>
        </button>
      ))}
    </div>
  );
}
