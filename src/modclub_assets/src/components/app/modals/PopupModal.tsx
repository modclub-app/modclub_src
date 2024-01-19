import * as React from "react";
import { useState, useEffect } from "react";
import { Modal, Heading, Button, Notification } from "react-bulma-components";
import { Form } from "react-final-form";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { format_token, getErrorMessage, isObject } from "../../../utils/util";
interface PopupModal {
  toggle: () => void;
  show: boolean;
  title: string;
  subtitle: string;
  handleSubmit: (values) => any;
  children: React.ReactNode;
  footerContent?: any;
  updateTable?: any;
  formStyle?: any;
  loader?: any;
  button1?: string;
  isSubmitDisabled?: boolean;
}

export default function PopupModal({
  toggle,
  show,
  title,
  subtitle,
  children,
  handleSubmit,
  formStyle = null,
  updateTable = null,
  footerContent = null,
  loader = null,
  button1 = "Submit",
  isSubmitDisabled = false,
}: PopupModal) {
  const dispatch = useAppStateDispatch();

  const cancelModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggle && toggle();
  };

  const onFormSubmit = async (values: any) => {
    try {
      await handleSubmit(values);
    } catch (e) {
      let errorMessage = "An unexpected error occurred.";
      if (e.message && e.message.includes("Reject text")) {
        let errAr = /Reject text: (.*)/g.exec(e.message);
        errorMessage = errAr ? errAr[1] : errorMessage;

        dispatch({
          type: "appendError",
          payload: errorMessage,
        });
      }
    }
  };
  return (
    <Modal show={show} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small">
        <Form
          onSubmit={onFormSubmit}
          render={({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <Modal.Card.Body style={formStyle}>
                <Heading subtitle className={"is-3"}>
                  {title}
                </Heading>

                {children}

                {updateTable &&
                  React.cloneElement(updateTable, { amount: values.amount })}
              </Modal.Card.Body>
              <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
                <Button.Group>
                  <Button disabled={loader} color="dark" onClick={cancelModal}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    className={loader ? "is-loading" : ""}
                    disabled={loader || isSubmitDisabled}
                  >
                    {button1}
                  </Button>
                </Button.Group>
              </Modal.Card.Footer>
            </form>
          )}
        />
      </Modal.Card>
    </Modal>
  );
}
