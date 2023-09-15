import * as React from "react";
import { Form, Field } from "react-final-form";
import {
  Notification,
  Columns,
  Card,
  Block,
  Heading,
  Button,
  Icon,
  Modal,
} from "react-bulma-components";

import { getAccAssocMetadata } from "../../../utils/api";
import { useProfile } from "../../../contexts/profile";
import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import { validateEmail } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import logger from "../../../utils/logger";
import { setUserToStorage } from "../../../utils/util";
import { KEY_LOCALSTORAGE_USER } from "../../../contexts/profile";
import {
  useAppState,
  // useAppStateDispatch,
} from "../../app/state_mgmt/context/state";

export default function NewProfile({ isPohFlow }: { isPohFlow: boolean }) {
  const history = useHistory();
  const appState = useAppState();
  // const dispatch = useAppStateDispatch();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const [accAssociation, setAccAssociation] = useState(false);
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

  const associateAccount = async () => {
    setAccAssociation(true);
    let data = await getAccAssocMetadata(modclub);
    setAccAssocMetadata(data);
    const localAssociationRedirect =
      "http://localhost:8080/?canisterId=" +
      process.env.MODCLUB_ASSET_OLD_CANISTER_ID +
      "#/app/associate/" +
      data.hash +
      "/" +
      data.targetCanister +
      "/" +
      window.location.search.replace("?canisterId=", "");
    const icAssociationRedirect =
      "https://" +
      process.env.MODCLUB_ASSET_OLD_CANISTER_ID +
      ".icp0.io/#/app/associate/" +
      data.hash +
      "/" +
      data.targetCanister +
      "/" +
      window.location.hostname;
    setAssocSourseLink(
      process.env.DFX_NETWORK == "local"
        ? localAssociationRedirect
        : icAssociationRedirect
    );
    setAccAssociation(false);
  };

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

      setUserToStorage(localStorage, KEY_LOCALSTORAGE_USER, user);
      // dispatch({ type: "fetchUserProfile" });

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
          <Block>
            <Card>
              <Card.Content>
                {accAssociation && (
                  <Modal show={true} showClose={false}>
                    <div className="loader is-loading p-5"></div>
                  </Modal>
                )}
                {accAssocMetadata ? (
                  <>
                    <Block>
                      <Heading textAlign="center" subtitle>
                        To migrate your Account you will be required to login to
                        your previous Modclub account.
                      </Heading>
                    </Block>
                    <Block textAlign="center">
                      <a href={assocSourseLink} target="_blank">
                        <Button color="primary" size="large">
                          Confirm
                        </Button>
                      </a>
                    </Block>
                  </>
                ) : (
                  <Card.Content className="level">
                    <Heading marginless subtitle>
                      Have an existing Modclub account ?
                    </Heading>
                    <Button
                      color="primary"
                      onClick={associateAccount}
                      disabled={!modclub}
                    >
                      Migrate Account
                    </Button>
                  </Card.Content>
                )}
              </Card.Content>
            </Card>
          </Block>
          <Block></Block>
          <Block>
            {!accAssocMetadata && (
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
                        >
                          Submit
                        </Button>
                      </form>
                    )}
                  />
                </Card.Content>
              </Card>
            )}
          </Block>
        </Columns.Column>
      </Columns>
    </>
  );
}
