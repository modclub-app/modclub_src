import { useParams } from "react-router";
import { useHistory, Link } from "react-router-dom";
import { Form, Field } from "react-final-form";
import {
  Notification,
  Columns,
  Card,
  Heading, 
  Button,
  Icon,
} from "react-bulma-components";
import { useRef, useState } from "react";
import { Steps, Step } from "../../common/steps/Steps";
import CapturePicture from "./CapturePicture";
import CaptureVideo from "./CaptureVideo";

const Signup = () => {
  const history = useHistory();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit!!!!")
    const { username, fullname, email, bio } = values;

    const validEmail = validateEmail(email)
    if (!validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return
    }

    setSubmitting(true);
    try {
      setTimeout(() => {
        setSubmitting(false);
        history.push("/signup2/2")
      }, 2000);
    } catch (e) {
      setMessage({ success: false, value: "Error!" });
      setSubmitting(false);
    }
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <>
      <Heading textAlign="center">
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

          <Button
            type="submit"
            disabled={!values.username || !values.fullname || !values.email || !values.bio || submitting}
            size="large"
            color="primary"
            fullwidth
            value="submit"
            className={submitting ? "is-loading" : ""}
          >
            Submit
          </Button>
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
      <Heading textAlign="center">
        Thank you for submitting.
      </Heading>
      <p>Your verification is in progress, please check back soon.</p>
      <Link to="/app" className="button is-primary mt-4">
        Back to MODCLUB
      </Link>
    </div>
  )
};

export default function NewProfile() {
  const [hasUser, setHasUser] = useState<boolean>(true);
  const [message, setMessage] = useState(null);
  // const [currentStepIndex, setCurrentStepIndex] = useState(1);

  const { currentStep } = useParams();
  console.log('currentStep', currentStep);


  return (
  <>
    <Columns centered vCentered className="is-fullheight mt-6">
      <Columns.Column size={6}>
        <Card>
          <Card.Content>
            <Steps activeStep={currentStep}>
              <Step id={'1'} details="Create Profile" />
              <Step id={'2'} details="Face Id" />
              <Step id={'3'} details="Video" />
              <Step id={'4'} details="Confirm" />
            </Steps>

            <Card backgroundColor="dark" className="mt-6">
              <Card.Content>
                {currentStep == 1 &&
                  <Signup />
                }
                {currentStep == 2 &&
                  <CapturePicture />
                }
                {currentStep == 3 &&
                  <CaptureVideo />
                }
                {currentStep == 4 &&
                  <Confirmation />
                }
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </Columns.Column>
    </Columns>

    {message &&
      <Notification color={message.success ? "success" : "danger"} className="has-text-centered">
        {message.value}
      </Notification>
    }
  </>
  );
}
