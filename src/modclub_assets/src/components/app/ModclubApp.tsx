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
import * as Constants from "../../utils/constant";
import { useActors } from "../../hooks/actors";
import { useAppState, useAppStateDispatch } from "./state_mgmt/context/state";

export default function ModclubApp() {
  const history = useHistory();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const { isConnected } = useConnect();
  const { providerIdText, providers, selectedProvider, setSelectedProvider } =
    useProfile();
  const [status, setStatus] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState<Array<String>>([]);
  const [token, setToken] = useState(null);
  const [isJwtSet, setJwt] = useState(false);
  const actors = useActors();
  const { modclub, wallet, vesting, rs } = actors;

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
      dispatch({ type: "fetchIsUserAdmin" });
      dispatch({ type: "fetchLeaderBoard", payload: { page: 1 } });
      dispatch({ type: "refetchContentModerationTasks", payload: false });
    }
  }, [isConnected, modclub]);

  useEffect(() => {
    if (isConnected && rs)
      if (appState.userProfile) {
        dispatch({ type: "fetchUserRS" });
      }
  }, [isConnected, rs, appState.userProfile]);

  useEffect(() => {
    if (isConnected && wallet) {
      dispatch({ type: "fetchDecimals" });
      dispatch({ type: "fetchTransactionFee" });
    }
  }, [isConnected, wallet]);

  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.personalBalanceLoading &&
      dispatch({ type: "fetchUserPersonalBalance" });
  }, [isConnected, appState.userProfile, appState.personalBalanceLoading]);

  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.systemBalanceLoading &&
      dispatch({ type: "fetchUserSystemBalance" });
  }, [isConnected, appState.userProfile, appState.systemBalanceLoading]);

  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.stakeBalanceLoading &&
      dispatch({ type: "fetchUserStakedBalance" });
  }, [isConnected, appState.userProfile, appState.stakeBalanceLoading]);
  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.unlockStakeLoading &&
      dispatch({ type: "fetchUserUnlockedStakedBalance" });
  }, [isConnected, appState.userProfile, appState.unlockStakeLoading]);
  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.claimedStakeLoading &&
      dispatch({ type: "fetchUserClaimedStakedBalance" });
  }, [isConnected, appState.userProfile, appState.claimedStakeLoading]);

  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.lockedBalanceLoading &&
      dispatch({ type: "fetchUserLockedBalance" });
  }, [isConnected, vesting, appState.userProfile, appState.lockedBalanceLoading]);

  useEffect(() => {
    if (!isJwtSet) {
      if (appState.userProfile?.role?.hasOwnProperty("admin")) {
        history.push("/app/admin");
      } else {
        isConnected && appState.userProfile && initialCall();
      }
    }
  }, [appState.userProfile, isConnected]);

  useEffect(() => {
    if (isConnected && !appState.userProfile && appState.requiresSignUp) {
      history.push("/signup");
    }
  }, [isConnected, appState.userProfile, appState.requiresSignUp]);

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
      {appState.userProfile &&
        status &&
        status != "verified" &&
        !selectedProvider &&
        token && (
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
            {appState.userProfile ? (
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
