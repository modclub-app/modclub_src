import * as React from 'react'
import { Switch, Route } from "react-router-dom";
import { useHistory, Link } from "react-router-dom";
import {
  Modal,
  Columns,
  Card,
  Heading,
} from "react-bulma-components";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { SignIn } from '../../auth/SignIn';
import { Steps, Step } from "../../common/steps/Steps";
import ProfileDetails from "./ProfileDetails";
import ProfilePic from "./ProfilePic";
import UserVideo from "./UserVideo";
import { verifyUserHumanity, retrieveChallengesForUser } from '../../../utils/api';

const Confirmation = () => {
  return (
    <div className="has-text-centered">
      <Heading subtitle textAlign="center">
        Thank you for submitting.
      </Heading>
      <p>Your verification is in progress, please check back soon.</p>
      <Link to="/app" className="button is-large is-primary mt-5">
        Back to MODCLUB
      </Link>
    </div>
  )
};

export default function NewPohProfile({ match }) {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState(null)
  const [currentStep, setCurrentStep] = useState<string>('')

  const initialCall = async () => {
    const verified = await verifyUserHumanity();

    const [status] = Object.keys(verified[0]);
    if (status === "verified") {
      history.push("/app");
      return
    }

    const token = verified[1][0].token;
    if (!token) return

    const challenges = await retrieveChallengesForUser(token);
    setLoading(false);
    setSteps(challenges["ok"]);

    const uncompleted = challenges["ok"].find(challenge => {
      const status = Object.keys(challenge.status)[0];
      return status === "notSubmitted"
    })

    // history.push(`${match.path}/${ uncompleted ? uncompleted.challengeId : "confirm" }`);
  }

  useEffect(() => {
    initialCall();
  }, []);

  useEffect(() => {
    return history.listen((location) => { 
      const result = /[^/]*$/.exec(location.pathname)[0];
      setCurrentStep(result);
    })
  }, [history])

  if (!isAuthenticated) return (
    <Columns centered vCentered className="mt-6">
      <Columns.Column size={6}>
        <Card>
          <Card.Content className="has-text-centered">
            <p className="my-6">You need to be logged in to view this page</p>
            <div style={{ width: 200, margin: "auto" }}>
              <SignIn />
            </div>
          </Card.Content>
        </Card>
      </Columns.Column>
    </Columns>
  );

  return (
  <>
    {loading &&
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    }

    <Columns centered vCentered className="is-fullheight mt-6">
      <Columns.Column size={6}>
        <Card>
          <Card.Content>
            {steps &&
              <Steps activeStep={currentStep}>
                {steps.map((step, index) => (
                  <Step key={step.challengeId} id={index + 1} details={step.challengeName} />
                ))}
                <Step key='confirm' id={steps.length + 1} details="Confirm" />
              </Steps>
            }

            <Card backgroundColor="dark" className="mt-6">
              <Card.Content>                
                <Switch>
                  <Route path={`${match.path}/:challenge-profile-details`} component={ProfileDetails}/>
                  <Route path={`${match.path}/:challenge-profile-pic`} component={ProfilePic}/>
                  <Route path={`${match.path}/:challenge-user-video`}>
                    {steps && <UserVideo steps={steps} />}
                  </Route>
                  <Route path={`${match.path}/:confirm`} component={Confirmation}/>
                </Switch>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </Columns.Column>
    </Columns>
  </>
  );
}
