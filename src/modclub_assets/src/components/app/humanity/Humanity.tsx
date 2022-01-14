import { Switch, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPohTasks } from '../../../utils/api';
import { Modal } from "react-bulma-components";
import ApplicantList from "./ApplicantList";
import Applicant from "./Applicant";

export default function Humanity() {
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Array<object>>([])
  // todo create type

  const initialCall = async () => {
    const status = { "new": null };
    const tasks = await getPohTasks(status);
    setTasks(tasks);
    setLoading(false);
  }

  useEffect(() => {
    initialCall();
  }, []);

  return (
    <>
      {loading &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }
      <Switch>
        <Route exact path="/app/poh">
          <ApplicantList applicants={tasks} />
        </Route>
        <Route path="/app/poh/:packageId">
          <Applicant data={tasks} />
        </Route>
      </Switch>
    </>
  )
}