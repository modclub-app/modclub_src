import Header from "../header/Header";
import { Route, Switch } from 'react-router-dom';
import Home from "./Home";
import NewProfile from "../auth/new_profile/NewProfile";
import Airdrop from "./Airdrop";

export default function External() {
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/signup" component={NewProfile} />
        <Route path="/terms" component={Home} />
        <Route path="/airdrop" component={Airdrop} />
      </Switch>
    </>
  );
}