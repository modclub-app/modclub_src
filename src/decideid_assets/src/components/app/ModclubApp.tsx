import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import NotAuthenticatedModal from "./modals/NotAuthenticated";

import { useConnect } from "@connect2icmodclub/react";
import { refreshJwt } from "../../utils/jwt";
import { useActors } from "../../hooks/actors";
import AdminRoute from "../common/AdminRoute/AdminRoute";


export default function ModclubApp() {
  const history = useHistory();

  const { isConnected, principal } = useConnect();

  if (!isConnected)
    return  <NotAuthenticatedModal />

  return (
    <>
      {principal}`
    </>
  );
}
