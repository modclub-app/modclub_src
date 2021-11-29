import { Switch, Route } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import { Columns } from "react-bulma-components";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Verifications from "./verification/Verifications";
import Verification from "./verification/Verification";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";
import Admin from "./admin/Admin";

export default function ModclubApp() {
  const { user } = useAuth();

  return (
    <>
      <Columns className="container" marginless>

        <Sidebar />

        <Columns.Column size="three-fifths" className="ml-6 mt-6">
          <Switch>
            <Route exact path="/app">
              Please login to view this page  
            </Route>
            <Route exact path="/app/tasks">
              <Tasks />
            </Route>
            <Route path="/app/tasks/:taskId">
              <Task /> 
            </Route>
            <Route exact path="/app/verifications">
              <Verifications />
            </Route>
            <Route path="/app/verifications/:verificationId">
              <Verification /> 
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