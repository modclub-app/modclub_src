import * as React from "react";
import { useEffect, useState } from "react";
import NotAuthenticatedModal from "./modals/NotAuthenticated";

import { useConnect } from "@connect2icmodclub/react";
import { useProfile } from "../../hooks/useProfile";

export default function Main() {
  const { principal } = useConnect();
  const { profile, isLoading } = useProfile();

  return (
    <>
      Your principal: {principal}
      {!!!isLoading ? <p>Email: {profile?.email}</p> : null}
    </>
  );
}
