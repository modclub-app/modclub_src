import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import { Columns } from "react-bulma-components";
import NotAuthenticatedModal from "./modals/NotAuthenticated";
import UserIncompleteModal from "./modals/UserIncompleteModal";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import PohApplicantList from "./poh/ApplicantList";
import PohApplicant from "./poh/Applicant";
import PohSubmittedApplicantList from "./poh/adminsubmittedcontent/SubmittedApplicantList";
import PohSubmittedApplicant from "./poh/adminsubmittedcontent/SubmittedApplicant";
import Moderators from "./moderators/Moderators";
import Leaderboard from "./moderators/Leaderboard";
import AlertConfirmation from "./poh/AlertConfirmation";
import Activity from "./profile/Activity";
import Admin from "./admin/Admin";
import AdminActivity from "./admin/RecentActivities";
import { useConnect } from "@connect2icmodclub/react";
import { useProfile } from "../../contexts/profile";
import { refreshJwt } from "../../utils/jwt";
import logger from "../../utils/logger";
import { useActors } from "../../hooks/actors";
import { useAppState, useAppStateDispatch } from "./state_mgmt/context/state";

export default function ModclubApp() {
  const history = useHistory();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const { isConnected } = useConnect();
  const {
    user,
    providerIdText,
    providers,
    selectedProvider,
    setSelectedProvider,
    isProfileReady,
    requiresSignUp,
  } = useProfile();
  const [status, setStatus] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState<Array<String>>([]);
  const [token, setToken] = useState(null);
  const [isJwtSet, setJwt] = useState(false);
  const actors = useActors();
  const { modclub, wallet, vesting } = actors;

  const initialCall = async () => {
    const result = await modclub.verifyUserHumanityForModclub();
    if (result.rejectionReasons && result.rejectionReasons.length) {
      setRejectionReasons(result.rejectionReasons);
    }
    const status = Object.keys(result.status)[0];
    setStatus(status);

    const token = result?.token;
    setToken(token);

    if (status == "verified" && refreshJwt(modclub)) {
      setJwt(true);
    }
  };

  useEffect(() => {
    if (isConnected && modclub) {
      dispatch({ type: "fetchUserProfile" });
    }
  }, [isConnected, modclub]);

  useEffect(() => {
    if (isConnected && wallet) {
      if (appState.userProfile) {
        dispatch({ type: "fetchDecimals" });
        dispatch({ type: "fetchUserSystemBalance" });
        dispatch({ type: "fetchUserLockedBalance" });
        dispatch({ type: "fetchUserPersonalBalance" });
      }
    }
  }, [isConnected, wallet, appState.userProfile]);

  useEffect(() => {
    if (isConnected && vesting) {
      if (appState.userProfile) {
        dispatch({
          type: "fetchUserLockedBalance",
          payload: { principal: appState.userProfile.id },
        });
      }
    }
  }, [isConnected, vesting, appState.userProfile]);

  useEffect(() => {
    if (!isJwtSet) {
      if (user?.role?.hasOwnProperty("admin")) {
        history.push("/app/admin");
      } else {
        isConnected && user && initialCall();
      }
    }
  }, [user, isConnected]);

  useEffect(() => {
    if (isConnected && isProfileReady && !user && requiresSignUp) {
      history.push("/signup");
    }
  }, [isConnected, user, requiresSignUp, isProfileReady]);

  const location = useLocation();
  const displayVerificationEmail = location.pathname.startsWith(
    "/app/confirm/poh/alerts/"
  );

  if (!isConnected)
    return displayVerificationEmail ? (
      <AlertConfirmation />
    ) : (
      <NotAuthenticatedModal />
    );

  return (
    <>
      {user && status && status != "verified" && !selectedProvider && token && (
        <UserIncompleteModal
          status={status}
          rejectionReasons={rejectionReasons}
          token={token}
        />
      )}
      <Columns
        className="container"
        marginless
        multiline={false}
        style={{ position: "static" }}
      >
        <Sidebar />

        <Columns.Column id="main-content" className="mt-6 pb-6">
          <Switch>
            <Route exact path="/app">
              <Tasks />
            </Route>
            <Route path="/app/tasks/:taskId">
              <Task />
            </Route>
            <Route exact path="/app/poh">
              <PohApplicantList />
            </Route>
            <Route exact path="/app/poh/:packageId">
              <PohApplicant />
            </Route>
            <Route exact path="/app/admin/poh">
              <PohSubmittedApplicantList />
            </Route>
            <Route exact path="/app/admin/poh/:packageId">
              <PohSubmittedApplicant />
            </Route>
            <Route exact path="/app/moderators">
              <Moderators />
            </Route>
            <Route exact path="/app/activity">
              <Activity />
            </Route>
            <Route exact path="/app/admin/activity/">
              <AdminActivity />
            </Route>
            <Route exact path="/app/leaderboard">
              <Leaderboard />
            </Route>
            <Route exact path="/app/confirm/poh/alerts/:userID+">
              <AlertConfirmation />
            </Route>
            {user ? (
              <Route exact path="/app/admin">
                {selectedProvider ? (
                  <Admin
                    selectedProvider={selectedProvider}
                    providerIdText={providerIdText}
                    setSelectedProvider={setSelectedProvider}
                    providers={providers}
                  />
                ) : (
                  <Tasks />
                )}
              </Route>
            ) : (
              <Route exact path="/app">
                <Tasks />
              </Route>
            )}
          </Switch>
        </Columns.Column>
      </Columns>
      <Footer />
    </>
  );
}
