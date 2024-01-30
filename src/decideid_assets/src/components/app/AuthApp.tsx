import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import NotAuthenticatedModal from "./modals/NotAuthenticated";

import { useConnect } from "@connect2icmodclub/react";


export default function AuthApp() {
  const history = useHistory();

  const { isConnected, principal } = useConnect();

  if (!isConnected)
    return  <NotAuthenticatedModal />

  return (
    <>
      Your principal: {principal}
    </>
  );
}
