import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import { Columns, Notification } from "react-bulma-components";
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
import { useConnect } from "@connect2icmodclub/react";
import { useProfile } from "../../contexts/profile";
import { refreshJwt } from "../../utils/jwt";
import { useActors } from "../../hooks/actors";
import { useAppState, useAppStateDispatch } from "./state_mgmt/context/state";
import AdminRoute from "../common/AdminRoute/AdminRoute";

// My Imports
import { useSetLoginPrincipalId } from "./MainPage/hooks/useSetLoginPrincipalId";
import { useFetchUserAdminTasks } from "./MainPage/hooks/useFetchUserAdminTasks";
import { useReFetchContentModerationTasks } from "./MainPage/hooks/useReFetchContentModerationTasks";
import { useReleaseUnStakedTokens } from "./MainPage/hooks/useReleaseUnStakedTokens";
import { useFetchUserLockBlock } from "./MainPage/hooks/useFetchUserLockBlock";

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
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const actors = useActors();
  const { modclub, wallet, vesting, rs } = actors;

  const initialCall = async () => {
    const result = await modclub.verifyUserHumanityForModclub();
    console.log("Debugging POH result:", result);
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

  useSetLoginPrincipalId();
  useFetchUserAdminTasks();
  useReFetchContentModerationTasks();
  useReleaseUnStakedTokens();
  useFetchUserLockBlock();

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
        dispatch({ type: "fetchUserUnlockedStakeBalance" });
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
      isConnected && appState.userProfile && initialCall();
    }
  }, [appState.userProfile, isConnected]);

  useEffect(() => {
    if (isConnected && !appState.userProfile && appState.requiresSignUp) {
      history.push("/signup");
    }
  }, [isConnected, appState.userProfile, appState.requiresSignUp]);

  useEffect(() => {
    if (isConnected && appState.accountDepositAction && wallet) {
      dispatch({ type: "depositToBalance" });
    }
  }, [isConnected, appState.accountDepositAction, wallet]);

  useEffect(() => {
    if (isConnected && appState.accountWithdrawAction && modclub) {
      dispatch({ type: "withdrawModeratorReward" });
    }
  }, [isConnected, appState.accountWithdrawAction, modclub]);

  useEffect(() => {
    if (isConnected && appState.stakeTokensAction && modclub) {
      dispatch({ type: "stakeTokens" });
    }
  }, [isConnected, appState.stakeTokensAction, modclub]);

  useEffect(() => {
    if (isConnected && appState.unstakeTokensAction && modclub) {
      dispatch({ type: "unstakeTokens" });
    }
  }, [isConnected, appState.unstakeTokensAction, modclub]);

  useEffect(() => {
    if (isConnected && appState.claimRewardsAction && modclub) {
      dispatch({ type: "claimRewards" });
    }
  }, [isConnected, appState.claimRewardsAction, modclub]);

  useEffect(() => {
    if (isConnected && appState.notifications.length > 0) {
      const notifText = appState.notifications[0];
      setNotification(notifText);
      setTimeout(() => {
        setNotification(null);
        dispatch({ type: "dropNotification", payload: notifText });
      }, 3000);
    }
  }, [isConnected, appState.notifications.length]);

  useEffect(() => {
    if (isConnected && appState.errors.length > 0) {
      const errText = appState.errors[0];
      setError(errText);
      setTimeout(() => {
        setError(null);
        dispatch({ type: "dropError", payload: errText });
      }, 3000);
    }
  }, [isConnected, appState.errors.length]);

  const location = useLocation();
  const displayVerificationEmail = location.pathname.startsWith(
    "/app/confirm/poh/alerts/"
  );

  if (!isConnected) {
    return displayVerificationEmail ? (
      <AlertConfirmation />
    ) : (
      <NotAuthenticatedModal />
    );
  }

  if (appState.userProfile && status && status !== "verified" && !selectedProvider && token) {
    console.log("Debug Info - UserProfile:", appState.userProfile);
    console.log("Debug Info - Status:", status);
    console.log("Debug Info - Selected Provider:", selectedProvider);
    console.log("Debug Info - Token:", token);
  }

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
        {notification && (
          <span
            style={{
              position: "absolute",
              zIndex: 9999,
              width: "100%",
              heigh: 300,
            }}
          >
            <Notification color={"success"} className="has-text-centered">
              {notification}
            </Notification>
          </span>
        )}
        {error && (
          <span
            style={{
              position: "absolute",
              zIndex: 9999,
              width: "100%",
              heigh: 300,
            }}
          >
            <Notification color={"danger"} className="has-text-centered">
              {error}
            </Notification>
          </span>
        )}
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
              path="/app/leaderboard"
              component={Leaderboard}
              appState={appState}
            />
            <Route exact path="/app/confirm/poh/alerts/:userID+">
              <AlertConfirmation />
            </Route>
            <Route exact path="/app">
              <Tasks />
            </Route>
          </Switch>
        </Columns.Column>
      </Columns>
      <Footer />
    </>
  );
}
