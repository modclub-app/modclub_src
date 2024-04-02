import * as React from "react";
import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import {
  Block,
  Button,
  Card,
  Columns,
  Heading,
  Icon,
  Notification,
} from "react-bulma-components";
import { KEY_LOCALSTORAGE_USER } from "../../../contexts/profile";
import { useHistory } from "react-router-dom";
import { setUserToStorage, validateEmail } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import logger from "../../../utils/logger";
import { useAppState } from "../../app/state_mgmt/context/state";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";
import { useConnect } from "@connect2icmodclub/react";

export default function NewProfile({ isPohFlow }: { isPohFlow: boolean }) {
  const history = useHistory();
  const appState = useAppState();
  const { principal } = useConnect();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const [accAssocMetadata, setAccAssocMetadata] = useState(null);
  const [assocSourseLink, setAssocSourseLink] = useState("");
  const modclub = useActors().modclub;
  const instructionText = isPohFlow
    ? "To begin POH create your MODCLUB profile"
    : "Create your profile";

  useEffect(() => {
    if (appState.userProfile) {
      history.push("/app");
    }
  }, [appState.userProfile, history]);

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
      logger.info("Submitting info: setSubmitting", true);
      logger.info("Submitting info: CURRENT_PRINCIPAL::", principal);
      logger.info("Submitting info: MODCLUB_ACTOR::", modclub);
      const user = modclub
        .registerModerator(username, email ? [email] : [])
        .then((u) => {
          logger.info("Submitting info: registerModerator result::", u);

          setUserToStorage(localStorage, KEY_LOCALSTORAGE_USER, user);

          // GTM: determine the number of profiles created;
          GTMManager.trackEvent(
            GTMEvent.UserCreatedProfileEventName,
            {
              uId: appState.loginPrincipalId,
              username,
              email,
              eventType: GTMTypes.UserCreatedProfileEventType,
            },
            ["uId", "username", "email"]
          );

          if (!isPohFlow) {
            setMessage({ success: true, value: "Sign Up Successful!" });
            setTimeout(() => {
              setMessage(null);
              history.push("/app");
            }, 2000);
          }
        })
        .catch((e) => {
          console.error("ERROR on registerModerator::", e);
        });
      logger.info("Submitting info: registerModerator promise::", user);
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
          <Block>
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
                        Please provide your email in order to receive email
                        alerts
                      </div>
                      <Button
                        type="submit"
                        disabled={!values.username || submitting}
                        size="large"
                        color="primary"
                        fullwidth
                        value="submit"
                        className={submitting ? "is-loading" : ""}
                        id={GTMEvent.UserCreatedProfileEventType}
                      >
                        Submit
                      </Button>
                    </form>
                  )}
                />
              </Card.Content>
            </Card>
          </Block>
        </Columns.Column>
      </Columns>
    </>
  );
}
