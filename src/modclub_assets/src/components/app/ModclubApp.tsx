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
import AdminRoute from "../common/AdminRoute/AdminRoute";

export default function ModclubApp() {
  const history = useHistory();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const { isConnected, principal } = useConnect();
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
    if (isConnected && principal)
      dispatch({ type: "setLoginPrincipalId", payload: principal });
  }, [isConnected, principal]);

  useEffect(() => {
    if (isConnected && modclub) {
      dispatch({ type: "fetchUserProfile" });
      dispatch({ type: "fetchIsUserAdmin" });
      dispatch({
        type: "refetchContentModerationTasks",
        payload: { FILTER_VOTES: false },
      });
    }
  }, [isConnected, modclub]);

  useEffect(() => {
    if (isConnected && appState.moderationTasksLoading)
      dispatch({
        type: "refetchContentModerationTasks",
        payload: { FILTER_VOTES: false },
      });
  }, [isConnected, appState.moderationTasksLoading]);

  useEffect(() => {
    if (isConnected && appState.providerBalanceLoading)
      dispatch({ type: "fetchProviderBalance" });
  }, [isConnected, appState.providerBalanceLoading]);

  useEffect(() => {
    if (isConnected && selectedProvider) {
      dispatch({ type: "setProviderId", payload: selectedProvider.id });
    }
  }, [isConnected, selectedProvider]);

  useEffect(() => {
    if (isConnected && rs && appState.loginPrincipalId)
      appState.rsLoading && dispatch({ type: "fetchUserRS" });
  }, [isConnected, rs, appState.loginPrincipalId, appState.rsLoading]);

  useEffect(() => {
    if (isConnected && wallet) {
      dispatch({ type: "fetchDecimals" });
      dispatch({ type: "fetchTransactionFee" });
    }
  }, [isConnected, wallet]);

  useEffect(() => {
    if (isConnected && appState.loginPrincipalId)
      appState.personalBalanceLoading &&
        dispatch({ type: "fetchUserPersonalBalance" });
  }, [isConnected, appState.loginPrincipalId, appState.personalBalanceLoading]);

  useEffect(() => {
    if (isConnected && appState.userProfile)
      appState.systemBalanceLoading &&
        dispatch({ type: "fetchUserSystemBalance" });
  }, [isConnected, appState.userProfile, appState.systemBalanceLoading]);

  useEffect(() => {
    if (isConnected && appState.loginPrincipalId && vesting)
      appState.stakeBalanceLoading &&
        dispatch({ type: "fetchUserStakedBalance" });
  }, [
    isConnected,
    vesting,
    appState.loginPrincipalId,
    appState.stakeBalanceLoading,
  ]);
  useEffect(() => {
    if (isConnected && appState.loginPrincipalId && vesting)
      appState.unlockStakeLoading &&
        dispatch({ type: "fetchUserUnlockedStakedBalance" });
  }, [
    isConnected,
    vesting,
    appState.loginPrincipalId,
    appState.unlockStakeLoading,
  ]);
  useEffect(() => {
    if (isConnected && appState.loginPrincipalId && vesting) {
      appState.claimedStakeLoading &&
        dispatch({ type: "fetchUserClaimedStakedBalance" });
    }
  }, [
    isConnected,
    vesting,
    appState.loginPrincipalId,
    appState.claimedStakeLoading,
  ]);

  useEffect(() => {
    if (isConnected && appState.loginPrincipalId && vesting) {
      appState.lockedBalanceLoading &&
        dispatch({ type: "fetchUserLockedBalance" });
    }
  }, [
    isConnected,
    vesting,
    appState.loginPrincipalId,
    appState.lockedBalanceLoading,
  ]);

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
            <AdminRoute
              path="/app/admin/activity/"
              component={AdminActivity}
              appState={appState}
            />
            <AdminRoute
              path="/app/leaderboard"
              component={Leaderboard}
              appState={appState}
            />
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
