import { Switch, Route } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import { Columns } from "react-bulma-components";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import ProofofHumanityList from "./humanity/ProofofHumanityList";
import ProofofHumanity from "./humanity/ProofofHumanity";
import Moderators from "./moderators/Moderators";
import Activity from "./profile/Activity";
import Admin from "./admin/Admin";

export default function ModclubApp() {

  return (
    <>
      <Columns className="container" marginless multiline={false}>

        <Sidebar />

        <Columns.Column id="main-content" className="mt-6 pb-6">
          <Switch>
            {/* <Route exact path="/app">
              Please login to view this page  
            </Route> */}
            <Route exact path="/app">
              <Tasks />
            </Route>
            <Route path="/app/tasks/:taskId">
              <Task /> 
            </Route>
            <Route exact path="/app/poh">
              <ProofofHumanityList />
            </Route>
            <Route path="/app/poh/:pohId">
              <ProofofHumanity /> 
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