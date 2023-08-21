import * as React from "react";
import { Form, Field } from "react-final-form";
import {
  Notification,
  Columns,
  Card,
  Heading,
  Button,
  Icon,
} from "react-bulma-components";
import { useProfile } from "../../../contexts/profile";
import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import { validateEmail } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import logger from "../../../utils/logger";
import { setUserToStorage } from "../../../utils/util";
import { KEY_LOCALSTORAGE_USER } from "../../../contexts/profile";

export default function NewProfile({ isPohFlow }: { isPohFlow: boolean }) {
  const history = useHistory();
  const { updateProfile, user } = useProfile();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);
  const modclub = useActors().modclub;
  const instructionText = isPohFlow
    ? "To begin POH create your MODCLUB profile"
    : "Create your profile";

  useEffect(() => {
    if (user) {
      history.push("/app");
    }
  }, [user, history]);

  const onFormSubmit = async (values: any) => {
    const { username, email } = values;
    const validEmail = validateEmail(email);
    if (email && !validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const regEx = /Reject text: (.*)/g;
    logger.info("Submitting info: username, email", username, email);
    try {
      setSubmitting(true);
      const user = await modclub.registerModerator(
        username,
        email ? [email] : []
      );

      updateProfile(user);

      if (!isPohFlow) {
        setMessage({ success: true, value: "Sign Up Successful!" });
        setTimeout(() => {
          setMessage(null);
          history.push("/app");
        }, 2000);
      }
    } catch (e) {
      logger.error("onFormSubmit: ", e);
      let errAr = regEx.exec(e.message);
      setMessage({ success: false, value: errAr ? errAr[1] : e });
      setSubmitting(false);
    }

    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <>
      {message && (
        <Notification
          color={message.success ? "success" : "danger"}
          className="has-text-centered"
        >
          {message.value}
        </Notification>
      )}

      <Columns centered vCentered className="is-fullheight">
        <Columns.Column size={6}>
          <Card>
            <Card.Content>
              <Heading textAlign="center">{instructionText}</Heading>

              <Form
                onSubmit={onFormSubmit}
                render={({ handleSubmit, values }) => (
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
                          name="email"
                          component="input"
                          type="text"
                          placeholder="Email (Optional)"
                          className="input is-medium"
                        />
                        <Icon align="left">
                          <span className="material-icons">email</span>
                        </Icon>
                      </div>
                    </div>
                    <div className="has-text-centered">
                      Please provide your email in order to receive email alerts
                    </div>
                    <Button
                      type="submit"
                      disabled={!values.username || submitting}
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
        </Columns.Column>
      </Columns>
    </>
  );
}
