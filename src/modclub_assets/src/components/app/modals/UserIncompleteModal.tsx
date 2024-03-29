import * as React from "react";
import { Link } from "react-router-dom";
import { Card, Heading, Modal } from "react-bulma-components";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";
import { useAppState } from "../state_mgmt/context/state";

export default function UserIncompleteModal({
  status,
  rejectionReasons,
  token,
}: {
  status: String;
  rejectionReasons: Array<String>;
  token: String;
}) {
  const appState = useAppState();
  // GTM: determine the number of users who start the Proof of Humanity;
  const handlerOnClick = () =>
    GTMManager.trackEvent(
      GTMEvent.PohChallengeEventName,
      {
        uId: appState.loginPrincipalId,
        eventType: GTMTypes.PohStartEventType,
      },
      ["uId"]
    );

  return (
    <Modal show={true} showClose={false} className="userIncompleteModal">
      <Modal.Card backgroundColor="circles">
        <Modal.Card.Body>
          <Heading subtitle>Proof of Humanity</Heading>
          {(status === "pending" || status === "processing") && (
            <p>
              Your Proof of Humanity approval is in progress. You will be able
              to access MODCLUB once it is approved. Please come back later to
              check your status.
            </p>
          )}
          {status === "expired" && (
            <p>
              Your proof of humanity has expired and needs to be renewed. Please
              do so now. MODCLUB has a 365 day expiration policy.
            </p>
          )}
          {(status === "startPoh" || status === "notSubmitted") && (
            <p>
              You have not submitted your Proof of Humanity. Please do so now.
            </p>
          )}
          {status === "rejected" && (
            <>
              <p>
                Your Proof of Humanity has been rejected. Please submit a new
                Proof of Humanity.
              </p>
            </>
          )}
          {status === "rejectedDuplicate" && (
            <>
              <p>
                Your Proof of Humanity has been rejected, duplicate account detected.
              </p>
            </>
          )}
        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-0" justifyContent="flex-end">
          {!(status === "pending" || status === "processing" || status === "verified" || status === "rejectedDuplicate") && (
            <Link
              to={`/new-poh-profile?token=${token}`}
              className="button is-primary"
              style={{ textDecoration: "none" }}
              onClick={handlerOnClick}
              id={GTMTypes.PohStartEventType}
            >
              Continue
            </Link>
          )}
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}
