import * as React from 'react'
import { Link } from "react-router-dom";
import { Modal, Heading, Card } from "react-bulma-components";


export default function UserIncompleteModal({
  status,
  rejectionReasons
}: {
  status: String;
  rejectionReasons: Array<String>;
}) {
  return (
    <Modal show={true} showClose={false} className="userIncompleteModal">
      <Modal.Card backgroundColor="circles">
        <Modal.Card.Body>
          <Heading subtitle>Proof of Humanity</Heading>
          {status === "pending" && (
            <p>
              Your Proof of Humanity approval is in progress. You will be
              able to access MODCLUB once it is approved. Please come back
              later to check your status.
            </p>
          )}
          {(status === "startPoh" || status === "notSubmitted") && (
            <p>
              You have not submitted your Proof of Humanity. Please do so now.
            </p>
          )}
          {status === "rejected" && <>
            <p>
              Your Proof of Humanity has been rejected. Please submit a new Proof of Humanity.
            </p>
            <p className="my-3">These were the failed requirements:</p>
            <Card backgroundColor="dark">
              <Card.Content>
                <ul>
                  {rejectionReasons && rejectionReasons.map((reason, index) => (
                    <li key={index}>
                      {index + 1}. {reason}
                    </li>
                  ))}
                </ul>
              </Card.Content>
            </Card>
          </>}
        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-0" justifyContent="flex-end">
          {(status === "startPoh" || status === "notSubmitted" || status === "rejected") && (
            <Link
              to="/new-poh-profile"
              className="button is-primary"
              style={{ textDecoration: "none" }}
            >
              Continue
            </Link>
          )}
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  )
};