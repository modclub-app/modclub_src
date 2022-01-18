import { Switch, Route } from "react-router-dom";
import Userstats from "../profile/Userstats";
import ApplicantList from "./ApplicantList";
import Applicant from "./Applicant";

export default function Humanity() {
  return (
    <>
      <Userstats />

      <Switch>
        <Route exact path="/app/poh">
          {/* <ApplicantList applicants={applicants} /> */}
          <ApplicantList />
        </Route>
        <Route path="/app/poh/:packageId">
          <Applicant />
        </Route>
      </Switch>
    </>
  )
}