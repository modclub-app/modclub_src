import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { useFormState } from "react-final-form";
import { getViolatedRules } from "../../../utils/util";
import {
  Button,
  Card,
  Heading,
  Modal,
  Notification,
} from "react-bulma-components";
import Confirm from "../../common/confirm/Confirm";
import { PohRulesViolated, ViolatedRules } from "../../../utils/types";
import approveImg from "../../../../assets/approve.svg";
import rejectImg from "../../../../assets/reject.svg";
import { useActors } from "../../../hooks/actors";
import * as Constant from "../../../utils/constant";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";
import { useAppState } from "../state_mgmt/context/state";

const ConfirmationModal = ({
  type,
  toggle,
  children,
}: {
  type: string;
  toggle: () => void;
  children: React.ReactNode;
}) => {
  const { packageId } = useParams();
  const { values } = useFormState();
  const [submitting, setSubmitting] = useState(null);
  const [message, setMessage] = useState(null);
  const history = useHistory();
  const { modclub } = useActors();
  const appState = useAppState();

  const isDisabled = () => {
    if (
      !values["voteIncorrectlyConfirmation"] ||
      !values["voteIncorrectlyConfirmation"].length
    )
      return true;
    if (type === "approve") {
      if (
        !values["voteRulesConfirmation"] ||
        !values["voteRulesConfirmation"].length
      )
        return true;
    }
    if (type === "reject") {
      let checked = 0;
      for (const key in values) {
        values[key].length && checked++;
      }
      if (checked < 2) return true;
    }
    return false;
  };

  const onFormSubmit = async () => {
    const rules = getViolatedRules(values).map((rule) => {
      let result: PohRulesViolated = {
        ruleId: rule.slice(-1),
        challengeId: rule.substring(0, rule.length - 2),
      };
      return result;
    });

    try {
      setSubmitting(true);
      const result = await modclub.votePohContent(
        packageId,
        type === "approve" ? { approved: null } : { rejected: null },
        rules
      );

      // GTM: determine the amount of voted “human verification” tasks;
      GTMManager.trackEvent(
        GTMEvent.HumanVerificationEventName,
        {
          uId: appState.loginPrincipalId,
          userLevel: Object.keys(appState.rs.level)[0],
          eventType: GTMTypes.HumanVerificationVotedEventType,
        },
        ["uId"]
      );

      setMessage({ success: true, value: "Vote submitted successfully" });
      setSubmitting(false);
      setTimeout(() => {
        toggle();
        history.push(`/app/poh`);
      }, 2000);
    } catch (e) {
      const regEx = /Reject text: (.*)/g;
      let errAr = regEx.exec(e.message);
      errAr
        ? setMessage({ success: false, value: errAr[1] })
        : setMessage({ success: false, value: e });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
        <Modal.Card backgroundColor="circles">
          <Modal.Card.Body>
            <img
              src={type === "approve" ? approveImg : rejectImg}
              className="my-5"
            />
            <Heading subtitle>
              {type === "approve" ? "Approve" : "Reject"} Confirmation
            </Heading>

            {children}
          </Modal.Card.Body>
          <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
            <Button.Group>
              <Button color="linear" onClick={toggle}>
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={isDisabled()}
                className={submitting && "is-loading"}
                onClick={onFormSubmit}
                id={GTMTypes.HumanVerificationVotedEventType}
              >
                Submit
              </Button>
            </Button.Group>
          </Modal.Card.Footer>
        </Modal.Card>

        {message && (
          <Notification
            color={message.success ? "success" : "danger"}
            textAlign="center"
          >
            {message.value}
          </Notification>
        )}
      </Modal>
    </>
  );
};

export default function ConfirmationModalToggle({
  formRules,
  reward,
}: {
  formRules: Array<ViolatedRules>;
  reward: number;
}) {
  const { values } = useFormState();
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const canVote = () => {
    const checked = Object.keys(values).filter(
      (rule) =>
        rule != "voteIncorrectlyConfirmation" && rule != "voteRulesConfirmation"
    );
    return checked.length === formRules.length ? false : true;
  };

  const toggleModal = () => {
    const filteredValues = Object.values(values).filter(
      (value) => typeof value === "string"
    );
    const confirmed = Object.values(values).filter(
      (value) => value === "confirm"
    );
    if (filteredValues.length === confirmed.length) {
      setShowApprove(true);
    } else {
      setShowReject(true);
    }
  };

  return (
    <>
      <Card.Footer className="pt-0" style={{ border: 0 }}>
        <Button
          size="large"
          color="primary"
          disabled={canVote()}
          style={{ width: 320, margin: "auto" }}
          type="button"
          onClick={toggleModal}
        >
          Submit
        </Button>
      </Card.Footer>

      {showApprove && (
        <ConfirmationModal type="approve" toggle={() => setShowApprove(false)}>
          <p>You are confirming that this is a real human.</p>
          <p>Voting incorrectly will result in loss of some staked tokens.</p>
          <Confirm
            type="warning"
            id="voteRulesConfirmation"
            label={Constant.VOTE_POH_RULE_CONFIRM_MSG}
          />
          <Confirm
            type="danger"
            id="voteIncorrectlyConfirmation"
            label={Constant.VOTE_INCORRECT_MSG}
          />
        </ConfirmationModal>
      )}
      {showReject && (
        <ConfirmationModal type="reject" toggle={() => setShowReject(false)}>
          <p className="mb-3">
            These are the failed requirements you selected:
          </p>
          <Card backgroundColor="grey">
            <Card.Content>
              <ul>
                {Object.keys(values).map(
                  (key, index) =>
                    values[key] != "confirm" &&
                    key != "voteIncorrectlyConfirmation" &&
                    key != "voteRulesConfirmation" && (
                      <li key={index}>
                        {index + 1}. {values[key]}
                      </li>
                    )
                )}
              </ul>
            </Card.Content>
          </Card>
          <Confirm
            type="danger"
            id="voteIncorrectlyConfirmation"
            label={Constant.VOTE_INCORRECT_MSG}
          />
        </ConfirmationModal>
      )}
    </>
  );
}
