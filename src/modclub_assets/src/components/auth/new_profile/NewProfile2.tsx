import { Form, Field } from "react-final-form";
import { Notification, Columns, Card, Heading, Media, Image as BulmaImage, Button, Icon } from "react-bulma-components";
import { registerModerator } from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { useHistory } from "react-router-dom";
import { useRef, useState } from "react";
import placeholder from "../../../../assets/user_placeholder.png";
import { Image, ImageData } from "../../../utils/types";
import { Steps, Step } from "../../common/steps/Steps";



const MAX_IMAGE_SIZE = 500000; // 500kb

const Signup = ({  }) => {
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
      }, 2000);
    } catch (e) {
      setMessage({ success: false, value: "Error!" });
      setSubmitting(false);
    }

    setTimeout(() => setMessage(null), 2000);
  };
  return (
    <Card>
      <Card.Content>
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
      </Card.Content>
    </Card>
  )
}

const Validate = ({  }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  return (
    <Card>
      <Card.Content>
        
        <Steps activeStep={currentStepIndex}>
          <Step id={'1'}  details="Create Profile" />
          <Step id={'2'}  details="Face Id" />
          <Step id={'3'}  details="Video" />
          <Step id={'4'}  details="Confirm" />
        </Steps>

        has user now! !!!
      </Card.Content>

      <Card.Footer>
        <Button.Group>
          <Button fullwidth onClick={() => setCurrentStepIndex(currentStepIndex - 1)}>
            Cancel
          </Button>
          <Button fullwidth color="primary" onClick={() => setCurrentStepIndex(currentStepIndex + 1)}>
            Next
          </Button>
        </Button.Group>
      </Card.Footer>
    </Card>
  )
}

export default function NewProfile() {
  const [hasUser, setHasUser] = useState<boolean>(true);
  const [message, setMessage] = useState(null);

  return (
  <>
    <Columns centered vCentered className="is-fullheight">
      <Columns.Column size={6}>
        {!hasUser ? <Signup /> : <Validate />}
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
