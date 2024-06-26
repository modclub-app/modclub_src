import * as React from "react";
import { useEffect, useState } from "react";
import { Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import { Button, Card, Columns, Heading, Modal } from "react-bulma-components";
import NotAuthenticatedModal from "../../app/modals/NotAuthenticated";
import { Step, Steps } from "../../common/steps/Steps";
import ProfilePic from "./ProfilePic";
import UserVideo from "./UserVideo";
import UserPhrases from "./UserPhrases";
import DrawingChallenge from "./DrawingChallenge";
import UniquePoh from "./UniquePoh";
import { modclub_types } from "../../../utils/types";
import { useActors } from "../../../hooks/actors";
import { useConnect } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../app/state_mgmt/context/state";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";

const Confirmation = ({ redirect_uri }) => {
  const appState = useAppState();
  const { disconnect } = useConnect();
  const handleRedirect = (e) => {
    e.preventDefault();
    disconnect();
    window.location.href = redirect_uri;
  };

  // GTM: determine the number of users who "poh completed";
  const handlerOnClick = () =>
    GTMManager.trackEvent(
      GTMEvent.PohChallengeEventName,
      {
        uId: appState.loginPrincipalId,
        eventType: GTMTypes.PohCompletedEventType,
      },
      ["uId"]
    );

  return (
    <div className="has-text-centered">
      <Heading subtitle textAlign="center">
        Thank you for submitting.
      </Heading>
      <p>Your verification is in progress, please check back soon.</p>

      {redirect_uri ? (
        <a
          href="#"
          onClick={handleRedirect}
          className="button is-large is-primary mt-5"
        >
          Back to App
        </a>
      ) : (
        <Link
          to="/app"
          className="button is-large is-primary mt-5"
          onClick={handlerOnClick}
          id={GTMTypes.PohCompletedEventType}
        >
          Back to MODCLUB
        </Link>
      )}
    </div>
  );
};

export default function NewPohProfile({ match }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const URLtoken = params.get("token");
  const { isConnected, disconnect } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState(null);
  const [currentStep, setCurrentStep] = useState<string>("");
  // const [hasInitialCall, setHasInitialCall] = useState<boolean>(false);
  const [noToken, setNoToken] = useState<boolean>(false);
  const [invalidToken, setInvalidToken] = useState<string | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const { modclub } = useActors();

  const initialCall = async (token) => {
    if (!token) {
      setNoToken(true);
      return;
    }

    setRedirectUri(params.get("redirect_uri"));

    const challenges = await modclub.retrieveChallengesForUser(token);
    setLoading(false);
    if (challenges.hasOwnProperty("ok")) {
      setSteps(challenges["ok"]);
      console.log("challenges", challenges);
      setLoading(false);
      setSteps(challenges["ok"]);

      const uncompleted = challenges["ok"].find((challenge) => {
        const status = Object.keys(challenge.status)[0];
        return status === "notSubmitted";
      });
      console.log("uncompleted", uncompleted);

      history.push(
        `${match.path}/${
          uncompleted
            ? uncompleted.challengeId + `?token=${URLtoken}`
            : "confirm"
        }`
      );
    } else {
      if (challenges.hasOwnProperty("err")) {
        let error: modclub_types.PohError = challenges["err"];
        if (error.hasOwnProperty("attemptToAssociateMultipleModclubAccounts")) {
          const originalPrincipal =
            error["attemptToAssociateMultipleModclubAccounts"];
          setInvalidToken(
            `Error - attempting to associate to multiple MODCLUB accounts is not allowed. Please continue your POH with the original principal ID: ${originalPrincipal}
            `
          );
        } else {
          setInvalidToken("Error invalid token: " + Object.keys(error)[0]);
        }
      } else {
        setInvalidToken("Unknown error");
      }
    }
  };

  useEffect(() => {
    isConnected && appState.userProfile && initialCall(URLtoken);
  }, [isConnected, appState.userProfile]);

  useEffect(() => {
    return history.listen((location) => {
      const result = /[^/]*$/.exec(location.pathname)[0];
      setCurrentStep(result);
    });
  }, [history]);

  if (noToken)
    return (
      <Modal show={true} showClose={false} className="userIncompleteModal">
        <Modal.Card backgroundColor="circles">
          <Modal.Card.Body>Error no URL token</Modal.Card.Body>
        </Modal.Card>
      </Modal>
    );

  if (invalidToken)
    return (
      <Modal show={true} showClose={false} className="userIncompleteModal">
        <Modal.Card backgroundColor="circles">
          <Modal.Card.Body>{invalidToken}</Modal.Card.Body>
        </Modal.Card>
      </Modal>
    );

  if (!isConnected) return <NotAuthenticatedModal />;

  if (isConnected && !appState.userProfile) history.push("/app");

  const goToNextStep = (currentStep) => {
    if (!steps) return;
    console.log("goToNextStep steps", steps);
    const index = steps.findIndex((step) => step.challengeId === currentStep);
    const nextStep = steps[index + 1];
    history.push(
      `${match.path}/${
        nextStep ? nextStep.challengeId + `?token=${URLtoken}` : "confirm"
      }`
    );
  };

  return (
    <>
      {loading && (
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      )}

      <Columns centered vCentered multiline className="mt-5">
        <Columns.Column size={6}>
          <Card className="poh-card">
            <Card.Content>
              {steps && (
                <>
                  <Steps activeStep={currentStep}>
                    {steps.map((step, index) => (
                      <Step
                        key={step.challengeId}
                        id={index + 1}
                        details={step.challengeName}
                      />
                    ))}
                    <Step
                      key="confirm"
                      id={steps.length + 1}
                      details="Confirm"
                    />
                  </Steps>

                  <Card className="mt-6 poh-card-content">
                    <Card.Content>
                      <Switch>
                        <Route path={`${match.path}/:challenge-profile-pic`}>
                          <ProfilePic goToNextStep={goToNextStep} />
                        </Route>
                        <Route path={`${match.path}/:challenge-user-video`}>
                          <UserVideo
                            step={steps.find(
                              (s) => s.challengeId == "challenge-user-video"
                            )}
                            goToNextStep={goToNextStep}
                          />
                        </Route>
                        <Route path={`${match.path}/:challenge-user-audio`}>
                          <UserPhrases
                            step={steps.find(
                              (s) => s.challengeId == "challenge-user-audio"
                            )}
                            goToNextStep={goToNextStep}
                          />
                        </Route>
                        <Route path={`${match.path}/:challenge-drawing`}>
                          <DrawingChallenge
                            step={steps.find(
                              (s) => s.challengeId == "challenge-drawing"
                            )}
                            goToNextStep={goToNextStep}
                          />
                        </Route>
                        <Route path={`${match.path}/:challenge-unique-poh`}>
                          <UniquePoh
                            step={steps.find(
                              (s) => s.challengeId == "challenge-unique-poh"
                            )}
                            goToNextStep={goToNextStep}
                          />
                        </Route>
                        <Route path={`${match.path}/:confirm`}>
                          <Confirmation redirect_uri={redirectUri} />
                        </Route>
                      </Switch>
                    </Card.Content>
                  </Card>
                </>
              )}
            </Card.Content>
          </Card>
        </Columns.Column>
      </Columns>
    </>
  );
}
