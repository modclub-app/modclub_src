import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import { Columns, Notification } from "react-bulma-components";
import { ProfileProvider } from "../../contexts/profile";
import NotAuthenticatedModal from "../../app/modals/NotAuthenticated";

import { SignIn } from "../../auth/SignIn";
import Footer from "../../footer/Footer";

import Admin from "./admin/Admin";
import AdminActivity from "./admin/RecentActivities";
import { useConnect } from "@connect2icmodclub/react";
import logger from "../../../utils/logger";

import { useActors } from "../../../hooks/actors";
import {
  useAppState,
  useAppStateDispatch,
} from "../../app/state_mgmt/context/state";

export default function ProviderLayout() {
  const history = useHistory();
  const location = useLocation();

  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const { isConnected, principal } = useConnect();
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const actors = useActors();
  const { modclub, wallet } = actors;

  useEffect(() => {
    if (isConnected && principal)
      dispatch({ type: "setLoginPrincipalId", payload: principal });
  }, [isConnected, principal]);

  useEffect(() => {
    if (isConnected && modclub) {
      dispatch({ type: "fetchIsUserAdmin" });
      dispatch({ type: "fetchUserProviders" });
    }
  }, [isConnected, modclub]);

  useEffect(() => {
    if (
      isConnected &&
      appState.selectedProvider
    ) {
      appState.providerBalanceLoading && dispatch({ type: "fetchProviderBalance" });
      appState.providerBufferBalanceLoading && dispatch({ type: "fetchProviderBufferBalance" });
    }
  }, [isConnected, appState.providerBalanceLoading, appState.providerBufferBalanceLoading, appState.selectedProvider]);

  useEffect(() => {
    if (isConnected && appState.selectedProvider) {
      dispatch({
        type: "setProviderId",
        payload: appState.selectedProvider.id,
      });
    }
  }, [isConnected, appState.selectedProvider]);

  useEffect(() => {
    if (isConnected && wallet) {
      dispatch({ type: "fetchDecimals" });
      dispatch({ type: "fetchTransactionFee" });
    }
  }, [isConnected, wallet]);

  useEffect(() => {
    if (isConnected && appState.loginPrincipalId && wallet) {
      appState.personalBalanceLoading &&
        dispatch({ type: "fetchUserPersonalBalance" });
    }
  }, [
    isConnected,
    wallet,
    appState.loginPrincipalId,
    appState.personalBalanceLoading,
  ]);

  useEffect(() => {
    if (isConnected && appState.accountDepositAction && wallet) {
      dispatch({ type: "depositToBalance" });
    }
  }, [isConnected, appState.accountDepositAction, wallet]);

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

  if (!isConnected) return <NotAuthenticatedModal />;

  return (
    <>
      {isConnected ? (
        <>
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
          <Columns
            className="container"
            marginless
            multiline={false}
            style={{ position: "static" }}
          >
            <Columns.Column id="main-content" className="mt-6 pb-6">
              <Switch>
                <Route exact path="/provider/admin">
                  <Admin />
                </Route>
                <Route exact path="/provider/admin/activity">
                  <AdminActivity />
                </Route>
              </Switch>
            </Columns.Column>
          </Columns>
          <Footer />
        </>
      ) : (
        <div className="airdrop-container">
          <div className="instructions">
            <h2>Sign in to manage provider stuff</h2>
            <p>
              Please ensure your principal is added as an admin by content
              provider.
            </p>
          </div>
          <div className="login">
            <SignIn />
          </div>
        </div>
      )}
    </>
  );
}
