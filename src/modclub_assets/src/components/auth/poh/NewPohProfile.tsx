import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { useHistory, Link, useLocation } from "react-router-dom";
import { Modal, Columns, Card, Heading, Button } from "react-bulma-components";
import { useEffect, useState } from "react";
import NotAuthenticatedModal from "../../app/modals/NotAuthenticated";
import NewProfile from "../new_profile/NewProfile";
import { Steps, Step } from "../../common/steps/Steps";
import ProfilePic from "./ProfilePic";
import UserVideo from "./UserVideo";
import UserPhrases from "./UserPhrases";
import DrawingChallenge from "./DrawingChallenge";
import { modclub_types } from "../../../utils/types";
import { useProfile } from "../../../contexts/profile";
import { useActors } from "../../../hooks/actors";
import { useConnect } from "@connect2icmodclub/react";

const Confirmation = ({ redirect_uri }) => {
  const { disconnect } = useConnect();
  const handleRedirect = (e) => {
    e.preventDefault();
    disconnect();
    window.location.href = redirect_uri;
  };

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
        <Link to="/app" className="button is-large is-primary mt-5">
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
  const { user } = useProfile();
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
    isConnected && user && initialCall(URLtoken);
  }, [isConnected, user]);

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

  if (isConnected && !user) return <NewProfile isPohFlow={true} />;

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

  const handleLogOut = async () => {
    disconnect();
  };

  return (
    <>
      {loading && (
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      )}

      <div className="is-flex is-justify-content-flex-end">
        <Button className="is-danger m-5" onClick={handleLogOut}>
          Logout
        </Button>
      </div>

      <Columns centered vCentered multiline className="is-fullheight">
        <Columns.Column size={6}>
          <Card>
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

                  <Card backgroundColor="dark" className="mt-6">
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
