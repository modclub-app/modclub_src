import { Switch, BrowserRouter, Route, useRouteMatch, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../utils/auth";
import { getAllContent } from "../../utils/api";
import { useHistory } from "react-router-dom";
import { SignIn } from "../Auth/SignIn";
import Sidebar from "../sidebar/Sidebar";
import Footer from "../footer/Footer";

function Topic() {
  return (
    <div>
      <h3>Topic</h3>
    </div>
  );
}



export default function ModclubApp() {
  const [content, setContent] = useState(null);
  const { isAuthReady, isAuthenticated, user, identity } = useAuth(); 
  const history = useHistory();

  const renderContent = async () => {
    const status = { 'new' : null };
    const content = await getAllContent(status);
    console.log({ content });
    let result = [];
   
    for (const item of content) {
      const str = item.id + " " + item.title + " " + item.text + " ";
      result.push(<li>{str}</li>);
    }
    setContent(<ul>{result}</ul>); 
  }

  useEffect(() => {
    renderContent();
    console.log({ identity, user });
    console.log(identity?.getPrincipal().toString())
    if (!user && isAuthenticated) {
      history.push("/signup");
    }
  }, [identity, user, history]);

  let { path, url } = useRouteMatch();

  console.log('path', path)

  const fullWidth = {
    width: '100%'
  };

  return (
    <>
      <section className="container columns">
        <Sidebar />
        <div className="column is-justify-content-flex-start mt-6 ml-6">

          <section className="container" style={fullWidth}>
            <div className="columns">
              <div className="column">
                <div className="card" style={fullWidth}>
                  <div className="card-content">
                    <div>
                      <p>Wallet</p>
                      <h3 className="subtitle">500</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="card" style={fullWidth}>
                  <div className="card-content">
                    <div>
                      <p>Staked</p>
                      <h3 className="subtitle">1000</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="card" style={fullWidth}>
                  <div className="card-content">
                    <div>
                      <p>Vote performance</p>
                      <h3 className="subtitle">50%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link to={`${url}/components`}>Components</Link>
            <Switch>
              <Route path="/app">
                <h3>here?</h3>
              </Route>
              <Route path={`${path}/components`}>
                <Topic />
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