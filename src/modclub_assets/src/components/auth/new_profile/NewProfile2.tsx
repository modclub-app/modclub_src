import * as React from 'react'
import { Switch, Route } from "react-router-dom";
import { useHistory, Link } from "react-router-dom";
import { Form, Field } from "react-final-form";
import {
  Modal,
  Notification,
  Columns,
  Card,
  Heading, 
  Button,
  Icon,
} from "react-bulma-components";
import { useEffect, useState } from "react";
import { Steps, Step } from "../../common/steps/Steps";
import CapturePicture from "./CapturePicture";
import CaptureVideo from "./CaptureVideo";
import { verifyUserHumanity, retrieveChallengesForUser, submitChallengeData } from '../../../utils/api';

const Signup = () => {
  const history = useHistory();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const onFormSubmit = async (values: any) => {
    const { username, fullname, email, bio } = values;

    const validEmail = validateEmail(email)
    if (!validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return
    }

    setSubmitting(true);
    try {
      const res = await submitChallengeData({
        challengeId: "challenge-profile-details",
        challengeDataBlob: [],
        userName: [username],
        email: [email],
        fullName: [fullname],
        aboutUser: [bio],
        offset: BigInt(1),
        numOfChunks: BigInt(1),
        mimeType: "profile",
        dataSize: BigInt(1)
      });
      console.log("res", res);

      // If the submission was successful
      if (res && "ok" in res.submissionStatus) {
        setTimeout(() => {
          setSubmitting(false);
          history.push("/signup2/challenge-profile-pic")
        }, 2000); // Do we need a 2 second delay?
      } else {
        throw Error("Failed to submit challenge data");
      }
    } catch (e) {
      console.log("error", e);
      setMessage({ success: false, value: "Error!" });
      setSubmitting(false);
    }
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <>
      {submitting &&
        <Modal show={true} showClose={false}>
          <div className="loader is-loading p-5"></div>
        </Modal>
      }
      <Heading subtitle textAlign="center">
        Create your profile
      </Heading>

      <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="control has-icons-left">
              <Field
                name="username"
                component="input"
                type="text"
                className="input is-medium"
                placeholder="Username"
              />
              <Icon align="left">
                <span className="material-icons">person</span>
              </Icon>
            </div>
          </div>

          <div className="field">
            <div className="control has-icons-left">
              <Field
                name="fullname"
                component="input"
                type="text"
                className="input is-medium"
                placeholder="Full Name"
              />
              <Icon align="left">
                <span className="material-icons">badge</span>
              </Icon>
            </div>
          </div>

          <div className="field">
            <div className="control has-icons-left">
              <Field
                name="email"
                component="input"
                type="text"
                placeholder="Email"
                className="input is-medium"
              />
              <Icon align="left">
                <span className="material-icons">email</span>
              </Icon>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <Field
                name="bio"
                component="textarea"
                placeholder="Tell us about yourself"
                className="textarea is-medium"
              />
            </div>
          </div>

          <Button.Group align="right">
            <Button
              type="submit"
              disabled={!values.username || !values.fullname || !values.email || !values.bio || submitting}
              size="large"
              color="primary"
              value="submit"
              className={submitting ? "is-loading" : ""}
            >
              Next
            </Button>
          </Button.Group>
        </form>
        )}
      />

      {message &&
        <Notification color={message.success ? "success" : "danger"} className="has-text-centered">
          {message.value}
        </Notification>
      }
    </>
  )
};

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

export default function NewProfile2({ match }) {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState(null)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [completed, setCompleted] = useState<string>('')

  const initialCall = async () => {
    const verified = await verifyUserHumanity();
    const [status] = Object.keys(verified[0]);
    console.log("status", status);
    if (status === "verified") {
      history.push("/app");
      return
    }

    const token = verified[1][0].token;
    if (!token) return

    const challenges = await retrieveChallengesForUser(token);
    console.log("challenges", challenges)
    setLoading(false);
    setSteps(challenges["ok"]);

    const uncompleted = challenges["ok"].find(challenge => {
      const status = Object.keys(challenge.status)[0];
      return status === "notSubmitted"
    })

    console.log("uncompleted", uncompleted)

    if (!uncompleted) {
      // history.push("/app");
      setCompleted("You have already submitted your application")
    } else {
      history.push(`/signup2/${uncompleted.challengeId}`)
    }
  }

  useEffect(() => {
    initialCall();
  }, []);

  useEffect(() => {
    return history.listen((location) => { 
      const result = /[^/]*$/.exec(location.pathname)[0];
      console.log("result", result);
      setCurrentStep(result);
    })
  },[history]) 

  return (
  <>
    {loading &&
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    }
    {completed &&
      <Notification color="success" className="has-text-centered">
        {completed}
      </Notification>
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
                  <Route path={`${match.path}/:challenge-profile-details`} component={Signup}/>
                  <Route path={`${match.path}/:challenge-profile-pic`} component={CapturePicture}/>
                  <Route
                    path={`${match.path}/:challenge-user-video`}
                    render={() => (<CaptureVideo steps={steps} />)}
                  />
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
