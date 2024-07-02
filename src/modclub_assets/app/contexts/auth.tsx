import React, { createContext, useContext, useEffect, useState } from "react";
import { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

import { Connect2ICProvider } from "@connect2icmodclub/react";


export function AuthProvider({ children, client }) {

  if (!client) {
    return null; // or <LoadingSpinner />;
  }

  return <Connect2ICProvider client={client}>{children}</Connect2ICProvider>;
}
