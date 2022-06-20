import * as React from 'react'
import { Switch, Route } from "react-router-dom";
import { useHistory, Link, useLocation } from "react-router-dom";
import {
  Modal,
  Columns,
  Card,
  Heading,
} from "react-bulma-components";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import NotAuthenticatedModal from '../../app/modals/NotAuthenticated';
import { Steps, Step } from "../../common/steps/Steps";
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
  const { search } = useLocation();
  const URLtoken = new URLSearchParams(search).get("token");  
  const { isAuthenticated, isAuthReady } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState(null)
  const [currentStep, setCurrentStep] = useState<string>('')

  const initialCall = async () => {
    let token
    if (!URLtoken) {
      const response = await verifyUserHumanity();
      if ('verified' in response.status) {
        history.push("/app");
        return
      }
      token = response.token;
      if (!token.length) return
    }

    const challenges = await retrieveChallengesForUser(URLtoken ? URLtoken : token[0].token);
    setLoading(false);``
    setSteps(challenges["ok"]);
    console.log("challenges", challenges);

    const uncompleted = challenges["ok"].find(challenge => {
      const status = Object.keys(challenge.status)[0];
      return status === "notSubmitted"
    })

    console.log("uncompleted", uncompleted);

    history.push(`${match.path}/${ uncompleted ? uncompleted.challengeId : "confirm" }`);
  }

  useEffect(() => {
    isAuthenticated && initialCall();
  }, [isAuthenticated]);

  useEffect(() => {
    return history.listen((location) => { 
      const result = /[^/]*$/.exec(location.pathname)[0];
      setCurrentStep(result);
    })
  }, [history])

  if (isAuthReady && !isAuthenticated) return (
    <NotAuthenticatedModal />
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
