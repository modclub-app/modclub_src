import * as React from "react";
import { Modal, Heading } from "react-bulma-components";
import { SignIn } from "../../auth/SignIn";

export default function NotAuthenticated() {
  return (
    <Modal show={true} closeOnBlur={false} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small auth-modal">
        <Modal.Card.Body textAlign="center">
          <Heading subtitle>
            You need to be logged in
            <br />
            to view this page
          </Heading>
        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-10 is-justify-content-flex-end is-block">
          <SignIn />
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}
