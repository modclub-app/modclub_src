import * as React from 'react'
import { useFormState } from "react-final-form";
import {
  Button,
  Card, 
} from "react-bulma-components";

export default function Fresh({ formRules }) {
  const formState = useFormState();
  const { values } = useFormState();

  // console.log("formState", formState);
  // console.log("formState values", values);

  const canVote = () => {
    const checked = Object.keys(values).filter(rule =>
      rule != "voteIncorrectlyConfirmation" && rule != "voteRulesConfirmation"
    );
    return checked.length === formRules.length ? false : true;
  }

  return (
    <Card.Footer className="pt-0" style={{ border: 0 }}>
      <Button
        size="large"
        color="primary"
        disabled={canVote()}
        style={{ width: 320, margin: "auto" }}
      >
        Submit
      </Button>
    </Card.Footer>
  );
};