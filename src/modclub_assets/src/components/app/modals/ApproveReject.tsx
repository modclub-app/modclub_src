import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import { Form } from "react-final-form";
import {
  Modal,
  Heading,
  Button,
  Card, 
  Notification
} from "react-bulma-components";
import Toggle from "../../common/toggle/Toggle";
import Confirm from "../../common/confirm/Confirm";
import approveImg from '../../../../assets/approve.svg';
import rejectImg from "../../../../assets/reject.svg";
import { vote, getProviderRules } from "../../../utils/api";
import { ContentPlus } from "../../../utils/types";

const Modal_ = ({
  title,
  image,
  task,
  toggle,
  onUpdate
}: {
  title: string;
  image: string;
  task: ContentPlus;
  toggle: () => void;
  onUpdate: () => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [content, setContent] = useState(<div className="loader is-loading"></div>);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState(null);

  const isDisabled = (values: any) => {
    if (!values["voteIncorrectlyConfirmation"] || !values["voteIncorrectlyConfirmation"].length) return true;
    if (title === "Approve Confirmation") {
      if (!values["voteRulesConfirmation"] || !values["voteRulesConfirmation"].length) return true;
    }
    if (title === "Reject Confirmation") {
      let checked = 0
      for (const key in values) {
        values[key].length && checked ++
      }
      if (checked < 2) return true;
    }
    return false;
  } 

  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
    const checked = []
    for (const key in values) {
      if (values[key][0]) checked.push(values[key][0])
    }

    setSubmitting(true);
    const regEx = /Reject text: (.*)/g;
    try {
      const result = await vote(task.id, title === "Approve Confirmation" ? { approved: null } : { rejected: null }, checked);
      console.log("result", result);
      setSubmitting(false);
      setMessage({ success: result === "Vote successful" ? true : false, value: result });
    } catch (e) {
      let errAr = regEx.exec(e.message);
      setMessage({ success: false, value: errAr[1] });
      setSubmitting(false);
    }
    setTimeout(() => {
      toggle();
      onUpdate();
    }, 2000);
  }

  useEffect(() => {
    const fetchRules = async () => {
      setSubmitting(true);
      const rules = await getProviderRules(task.providerId);
      console.log({ rules });
      setRules(rules);
      setSubmitting(false);

      if (title === "Approve Confirmation") {
        setContent(<>
          <p>You are confirming that this post follows {task.providerName}'s rules.</p>
          <p>Voting incorrectly will result in some loss of staked tokens.</p>

          <Card backgroundColor="dark" className="mt-5">
            <Card.Content>
              <Heading subtitle className="mb-3">
                {task.providerName}'s Rules
              </Heading>
              <ul style={{ listStyle: "disc", paddingLeft: "2rem", color: "#fff" }}>
                {rules.map(rule => 
                  <li key={rule.id}>{rule.description}</li>
                )}
              </ul>
            </Card.Content>
          </Card>

          <Confirm
            type="warning"
            id="voteRulesConfirmation"
            label="I confirm that this content does not break any rules above"
          />
        </>);
      }
      if (title === "Reject Confirmation") {
        setContent(<>
          <p className="mb-3">Select which rules were broken:</p>
          <Card backgroundColor="dark">
            <Card.Content>
              {rules.map(rule => 
                <Toggle key={rule.id} id={rule.id} label={rule.description} />
              )}
            </Card.Content>
          </Card>
        </>);
      }
    };
    fetchRules();
  }, []);


  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles">
        <Form onSubmit={onFormSubmit} render={({ handleSubmit, values, pristine }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Card.Body>
              <img src={image} className="my-5" />
              <Heading subtitle>
                {title}
              </Heading>

              {content}

              <Confirm
                type="danger"
                id="voteIncorrectlyConfirmation"
                label={`I understand I will lose ${task.minStake} MOD if I vote incorrectly`}
              />
            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
              <Button.Group>
                <Button color="dark" onClick={toggle}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={isDisabled(values)}
                  className={submitting && "is-loading"}
                  value=""
                >
                  Submit
                </Button>
              </Button.Group>
            </Modal.Card.Footer>
          </form>
        )}
        />
      </Modal.Card>
      {message &&
        <Notification color={message.success ? "success" : "danger"} textAlign="center">
          {message.value}
        </Notification>
      }
    </Modal>
  );
};

export default function ApproveReject({
  task,
  fullWidth = false,
  onUpdate,
} : {
  task: ContentPlus;
  fullWidth?: boolean;
  onUpdate: () => void;
}) {
  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const togglReject = () => setShowReject(!showReject);

  return (
    <>
      <Button
        color="danger"
        fullwidth={fullWidth}
        onClick={togglReject}
        disabled={!!task.hasVoted[0]}
      >
        Reject
      </Button>
      <Button
        color="primary"
        fullwidth={fullWidth}
        onClick={toggleApprove}
        className="ml-4"
        disabled={!!task.hasVoted[0]}
      >
        Approve
      </Button>

      {showApprove &&
        <Modal_
          title="Approve Confirmation"
          image={approveImg}
          task={task}
          toggle={toggleApprove}
          onUpdate={onUpdate}
        />
      }
      {showReject &&
        <Modal_
          title="Reject Confirmation"
          image={rejectImg}
          task={task}
          toggle={togglReject}
          onUpdate={onUpdate}
        />
      }
    </>
  );
};