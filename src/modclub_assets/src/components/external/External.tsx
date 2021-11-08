import Header from "../header/Header";
import { Route, Switch } from 'react-router-dom';
import Home from "./Home";
import NewProfile from "../auth/humanity/new_profile/NewProfile";

export default function External() {
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/signup" component={NewProfile} />
        <Route path="/terms" component={Home} />
      </Switch>
    </>
  );
}