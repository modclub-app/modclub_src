import * as React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Columns } from "react-bulma-components";
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

import { getUserFromCanister } from "../../utils/api";

export default function ModclubApp() {
  const [user, setUser] = React.useState(null);
  const [isAdmin, setAdmin] = React.useState(false);
  React.useEffect(() => {
    const asyncReroute = async () => {
      const user = await getUserFromCanister();
      setUser(user);
    };

    asyncReroute();
  }, [user]);

  return (
    <>
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

            {user && user.role.admin ? (
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
