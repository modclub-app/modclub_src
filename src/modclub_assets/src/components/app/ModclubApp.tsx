import { Switch, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";
import { useEffect, useState } from "react";
import { getAllProfiles } from '../../utils/api';
import { Principal } from "@dfinity/principal";

function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    const fetchProfiles = async () => {
      const profiles = await getAllProfiles();
      console.log({ profiles });  
      let userProfiles = profiles.map((p) => {
        return (
          <div>
            <p>ID: {p.id.toText()}</p>
            <p>userName: {p.userName}</p>
            <p>email: {p.email}</p>
            <p>createdAt: {p.createdAt }</p>
        </div>)
      });
      setProfiles(userProfiles);
    };

    fetchProfiles();
  }, []);

  return (
    <div>
      <h3>Dashboard</h3>
      {profiles}
    </div>
  );
}

export default function ModclubApp() {

  return (
    <>
      <section className="container columns mb-0">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-5 ml-6">

          <section className="container">

            {/* <Userstats /> */}

            <Switch>
              <Route exact path="/app">
                <Dashboard />
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
            </Switch>

          </section>
        </div>
      </section>
      <Footer />
    </>
  )
  
  // if (isAuthReady && isAuthenticated && user) {
  //   return <h1>Welcome {user}</h1>;
  // } else {
  //   return (<SignIn />)
  // }
}