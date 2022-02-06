import * as React from 'react'
import { useEffect, useState } from "react";
import { Switch, Route, Link } from "react-router-dom";
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
import { verifyUserHumanity } from '../../utils/api';
import { refreshJwt } from '../../utils/jwt';

export default function ModclubApp() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState(null);

  const initialCall = async () => {
    const result = await verifyUserHumanity();
    const status = Object.keys(result.status)[0];
    refreshJwt()
    setStatus(status);
  }

  useEffect(() => {
    isAuthenticated && initialCall();
  }, [isAuthenticated]);

  return (
    <>
      { status &&  status != "verified" &&
         <Modal show={true} showClose={false}>
         <Modal.Card backgroundColor="circles">
           <Modal.Card.Body>
             <Heading subtitle>
              Proof of Humanity
             </Heading>
             { status === "pending" &&
              <p>Your Proof of Humanity approval is in progress. You will be able to access MODCLUB once it is approved. Please come back later to check your status.</p>
             }
             { status === "notSubmitted" &&
              <p>You have not submitted your Proof of Humanity. Please do so now.</p>
             }
           </Modal.Card.Body>
           <Modal.Card.Footer className="pt-0" justifyContent="flex-end">
              {status === "notSubmitted" && <Link to="/new-poh-profile" className="button is-primary" style={{ textDecoration: "none" }}>
                Continue
              </Link>}
           </Modal.Card.Footer>
         </Modal.Card>
       </Modal>
      }
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
            <Route exact path="/app/admin">
              <Admin />
            </Route>
          </Switch>
        </Columns.Column>
      </Columns>
      
      <Footer />
    </>
  )
}