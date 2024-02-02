import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import NotAuthenticatedModal from "./modals/NotAuthenticated";

import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../utils";


export default function AuthApp() {

  const { isConnected, principal } = useConnect();
  const { decideid } = useActors();

  if (!isConnected)
    return  <NotAuthenticatedModal />

  return (
    <>
      Your principal: {principal}
    </>
  );
}
