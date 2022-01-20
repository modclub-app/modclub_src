import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, Field } from "react-final-form";
import {
  Modal,
  Heading,
  Button,
  Icon,
  Notification
} from "react-bulma-components";
import { submitChallengeData } from '../../../utils/api';

export default function ProfileDetails() {
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
          history.push("/new-poh-profile/challenge-profile-pic")
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
}