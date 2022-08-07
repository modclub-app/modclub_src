import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";
import { Columns, Modal, Heading } from "react-bulma-components";
import NotAuthenticatedModal from './modals/NotAuthenticated';
import UserIncompleteModal from './modals/UserIncompleteModal';
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
import Activity from "./profile/Activity";
import Admin from "./admin/Admin";
import AdminActivity from "./admin/RecentActivities";
import { useAuth } from "../../utils/auth";
import { verifyUserHumanity } from "../../utils/api";
import { refreshJwt } from "../../utils/jwt";

import { getUserFromCanister } from "../../utils/api";

export default function ModclubApp() {
  const history = useHistory();
  const { isAuthenticated, isAuthReady, user, selectedProvider, providerIdText, providers,setSelectedProvider } = useAuth();
  const [status, setStatus] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState<Array<String>>([]);
  const [token, setToken] = useState(null);
  const [isJwtSet, setJwt] = useState(false);

  const initialCall = async () => {
    const result = await verifyUserHumanity();

    if (result.rejectionReasons && result.rejectionReasons.length) {
      setRejectionReasons(result.rejectionReasons);
    }
    const status = Object.keys(result.status)[0];
    setStatus(status);

    const token = result?.token;
    setToken(token);

    if (status == "verified" && await refreshJwt()) {
      setJwt(true);
    }
  };

  useEffect(() => {
    if (!isJwtSet) {
      if (user?.role?.hasOwnProperty("admin")) {
        history.push("/app/admin");
      } else {
        isAuthenticated && user && initialCall();
      }
    }
  }, [user, isAuthenticated]);

  if (isAuthReady && !isAuthenticated) return (
    <NotAuthenticatedModal />
  );

  return (
    <>
      {user && status && status != "verified" && !selectedProvider && token &&
        <UserIncompleteModal
          status={status}
          rejectionReasons={rejectionReasons}
          token={token}
        />
      }
      <Columns className="container" marginless multiline={false} style={{ position: 'static' }}>
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
            {user ? (
              <Route exact path="/app/admin">
                {
                  selectedProvider ? (<Admin selectedProvider={selectedProvider} providerIdText={providerIdText} setSelectedProvider={setSelectedProvider} providers={providers} />) : (<Tasks />)
                }
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
