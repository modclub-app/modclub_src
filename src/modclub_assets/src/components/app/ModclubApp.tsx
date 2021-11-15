import { Switch, BrowserRouter, Route, useRouteMatch, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../utils/auth";
import { useHistory } from "react-router-dom";
import { SignIn } from "../Auth/SignIn";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";

import walletImg from '../../../assets/wallet.svg';
import stakedImg from '../../../assets/staked.svg';
import performanceImg from '../../../assets/performance.svg';

function Dashboard() {
  return (
    <div>
      <h3>Dashboard</h3>
    </div>
  );
}

export default function ModclubApp() {
  const { isAuthReady, isAuthenticated, user, identity } = useAuth(); 
  const history = useHistory();

  useEffect(() => {
    console.log({ identity, user });
    console.log(identity?.getPrincipal().toString())
    if (!user && isAuthenticated) {
      // history.push("/signup");
    }
  }, [identity, user, history]);

  const fullWidth = {
    width: '100%'
  };

  return (
    <>
      <section className="container columns mb-0">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-4 ml-5 pb-6">

          <section className="container" style={fullWidth}>
            <div className="columns">
              <div className="column">
                <div className="card" style={fullWidth}>
                  <div className="card-content is-flex">
                    <img src={walletImg} />
                    <div className="ml-3">
                      <p style={{ lineHeight: 1 }}>Wallet</p>
                      <h3 className="title is-size-1" style={{ lineHeight: 1 }}>500</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="card" style={fullWidth}>
                  <div className="card-content is-flex">
                    <img src={stakedImg} />
                    <div className="ml-3">
                      <p style={{ lineHeight: 1 }}>Staked</p>
                      <h3 className="title is-size-1" style={{ lineHeight: 1 }}>1000</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="card" style={fullWidth}>
                <div className="card-content is-flex">
                    <img src={performanceImg} />
                    <div className="ml-3">
                      <p style={{ lineHeight: 1 }}>Vote performance</p>
                      <h3 className="title is-size-1" style={{ lineHeight: 1 }}>50%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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