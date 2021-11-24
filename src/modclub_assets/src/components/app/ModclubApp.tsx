import { Switch, Route } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import { useHistory } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";
import Admin from "./admin/Admin";
import { useEffect, useState } from "react";
import { getAllProfiles } from '../../utils/api';
import { Principal } from "@dfinity/principal";

export default function ModclubApp() {
  const history = useHistory();
  const [profiles, setProfiles] = useState([]);

  const { logIn, isAuthenticated, user } = useAuth();
  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log("push signup")
      // history.push("/signup")
    }
  }, [isAuthenticated, user]);

  // useEffect(() => {
  //   const fetchProfiles = async () => {
  //     const profiles = await getAllProfiles();
  //     console.log('profiles', { profiles });  
  //     let userProfiles = profiles.map((p) => {
  //       return (
  //         <div>
  //           <p>ID: {p.id.toText()}</p>
  //           <p>userName: {p.userName}</p>
  //           <p>email: {p.email}</p>
  //           <p>createdAt: {p.createdAt }</p>
  //       </div>)
  //     });
  //     setProfiles(userProfiles);
  //   };

  //   fetchProfiles();
  // }, []);

  return (
    <>
      <section className="container columns mb-0">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-5 ml-6">
          <section className="container">
            <Switch>
              <Route exact path="/app">
                Dashboard
                {profiles}
              </Route>
              <Route exact path="/app/tasks">
                <Tasks />
              </Route>
              <Route path="/app/tasks/:taskId">
                <Task /> 
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
          </section>
        </div>
      </section>
      <Footer />
    </>
  )
}