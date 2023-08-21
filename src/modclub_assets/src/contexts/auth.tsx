import React, { createContext, useContext, useEffect, useState } from "react";
import { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import * as modclub from "../../../declarations/modclub_qa";
import * as rs from "../../../declarations/rs_qa";
import * as vesting from "../../../declarations/vesting_qa";
import * as wallet from "../../../declarations/wallet_qa";

/*
 * Connect2ic provides essential utilities for IC app development
 */
import { createClient } from "@connect2ic/core";
import {
  InternetIdentity,
  PlugWallet,
  StoicWallet,
} from "@connect2ic/core/providers";
import { Connect2ICProvider } from "@connect2ic/react";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const providers_cb = (config) => {
  const II_config = deepCopy(config);
  II_config["providerUrl"] = process.env.LOCAL_II_CANISTER;
  return [
    new InternetIdentity(II_config),
    new PlugWallet(config),
    new StoicWallet(config),
  ];
};

export function AuthProvider({ children }) {
  const client = createClient({
    canisters: {
      modclub,
      rs,
      vesting,
      wallet,
    },
    providers: providers_cb,
  });
  return <Connect2ICProvider client={client}>{children}</Connect2ICProvider>;
}
