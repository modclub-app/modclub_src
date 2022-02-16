import * as React from "react";
import { useEffect, useState } from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";
import { Columns, Modal, Heading } from "react-bulma-components";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import PohApplicantList from "./poh/ApplicantList";
import PohApplicant from "./poh/Applicant";
import Moderators from "./moderators/Moderators";
import Leaderboard from "./moderators/Leaderboard";
import Activity from "./profile/Activity";
import Admin from "./admin/Admin";
import { useAuth } from "../../utils/auth";
import { verifyUserHumanity } from "../../utils/api";
import { refreshJwt } from "../../utils/jwt";

import { getUserFromCanister } from "../../utils/api";

export default function ModclubApp() {
  const history = useHistory();
  // useEffect(() => {
  //   const asyncReroute = async () => {
  //     const user = await getUserFromCanister();
  //     setUser(user);
  //   };
  //   asyncReroute();
  // });

  const { isAuthenticated, isAuthReady, user } = useAuth();
  const [status, setStatus] = useState(null);
  const [isJwtSet, setJwt] = useState(false);

  const initialCall = async () => {
    const result = await verifyUserHumanity();
    const status = Object.keys(result.status)[0];

    refreshJwt();
    setJwt(true);
    setStatus(status);
  };

  useEffect(() => {
    if (!isJwtSet) {
      if (user?.role?.hasOwnProperty("admin")) {
        history.push("/app/admin");
      } else {
        user && initialCall();
      }
    }
  }, [user]);

  return (
    <>
      {!user?.role?.hasOwnProperty("admin") && status && status != "verified" && (
        <Modal show={true} showClose={false}>
          <Modal.Card backgroundColor="circles">
            <Modal.Card.Body>
              <Heading subtitle>Proof of Humanity</Heading>
              {status === "pending" && (
                <p>
                  Your Proof of Humanity approval is in progress. You will be
                  able to access MODCLUB once it is approved. Please come back
                  later to check your status.
                </p>
              )}
              {status === "notSubmitted" && (
                <p>
                  You have not submitted your Proof of Humanity. Please do so
                  now.
                </p>
              )}
              {status === "rejected" && (
                <p>
                  Your Proof of Humanity has been rejected. Please submit a new
                  Proof of Humanity.
                </p>
              )}
            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0" justifyContent="flex-end">
              {(status === "notSubmitted" || status === "rejected") && (
                <Link
                  to="/new-poh-profile"
                  className="button is-primary"
                  style={{ textDecoration: "none" }}
                >
                  Continue
                </Link>
              )}
            </Modal.Card.Footer>
          </Modal.Card>
        </Modal>
      )}
      <Columns className="container" marginless multiline={false}>
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
            <Route exact path="/app/moderators">
              <Moderators />
            </Route>
            <Route exact path="/app/activity">
              <Activity />
            </Route>
            {user && user?.role?.hasOwnProperty("admin") ? (
              <Route exact path="/app/admin">
                <Admin />
              </Route>
            ) : (
              ""
            )}
          </Switch>
        </Columns.Column>
      </Columns>

      <Footer />
    </>
  );
}
