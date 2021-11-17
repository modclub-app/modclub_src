import { Switch, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";

function Dashboard() {
  return (
    <div>
      <h3>Dashboard</h3>
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