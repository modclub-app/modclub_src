import { Switch, Route } from "react-router-dom";
import { useAuth } from "../../utils/auth";
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
  const { user } = useAuth();

  return (
    <>
      <section className="container columns mb-0">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-5 ml-6">
          <section className="container">
            <Switch>
              <Route exact path="/app">
                Please login to view this page  
              </Route>

              {user &&
              <>
                <Route exact path="/app/tasks">
                  <Tasks />
                </Route>
                <Route path="/app/tasks/:taskId">
                  <Task /> 
                </Route>
              </>
              }
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