import { Switch, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Footer from "../footer/Footer";
import Tasks from "./tasks/Tasks";
import Task from "./tasks/Task";
import Moderators from "./moderators/Moderators";
import Activity from "./activity/Activity";
import "./ModclubApp.scss";

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

  return (
    <>
      <section className="container columns mb-0">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-5 ml-6">

          <section className="container">
            <div className="stat-boxes columns mb-5">
              <div className="column pb-0">
                <div className="card is-fullheight">
                  <div className="card-content">
                    <img src={walletImg} />
                    <div>
                      <p>Wallet</p>
                      <h3 className="title is-size-1">500</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column pb-0">
                <div className="card is-fullheight">
                  <div className="card-content">
                    <img src={stakedImg} />
                    <div>
                      <p>Staked</p>
                      <h3 className="title is-size-1">1000</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column pb-0">
                <div className="card is-fullheight">
                <div className="card-content">
                    <img src={performanceImg} />
                    <div>
                      <p>Vote performance</p>
                      <h3 className="title is-size-1">50%</h3>
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