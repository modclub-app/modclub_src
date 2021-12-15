import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { Modal, Heading, Button, Card, Dropdown, Notification } from "react-bulma-components";
import Toggle from "../../common/toggle/Toggle";
import approveImg from '../../../../assets/approve.svg';
import rejectImg from "../../../../assets/reject.svg";
import { vote, getProviderRules } from "../../../utils/api";

const RulesList = ({ platform, rules }) => {  
  return (
    <Dropdown
      hoverable
      up
      label={`View ${platform}'s Rules`}
      color="ghost"
      style={{ width: 100 }}
    >
      {rules.map((rule) => (
        <Dropdown.Item key={rule.id} value={rule.id} renderAs="a" style={{ textDecoration: "none" }}>
          {rule.description}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

const Modal_ = ({
  title,
  image,
  platform,
  toggle,
  id,
  providerId,
  onUpdate
}: {
  title: string;
  image: string;
  platform: string;
  toggle: () => void;
  id: string;
  providerId: Principal;
  onUpdate: () => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [content, setContent] = useState(<div className="loader is-loading"></div>);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
    const checked = []
    for (const key in values) {
      if (values[key][0]) checked.push(values[key][0])
    }

    setSubmitting(true);
    const regEx = /Reject text: (.*)/g;
    try {
      const result = await vote(id, title === "Approve Confirmation" ? { approved: null } : { rejected: null }, checked);
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
      const rules = await getProviderRules(providerId);
      console.log({ rules });       
      setRules(rules);
      setSubmitting(false);

      if (title === "Approve Confirmation") {
        setContent(<>
          <p>You are confirming that this post follows {platform}'s rules.</p>
          <p>Voting incorrectly will result in some loss of staked tokens.</p>
        </>);
      }
      if (title === "Reject Confirmation") {
        setContent(
          <>
            <p className="mb-3">Select which rules were broken:</p>
            <Card backgroundColor="dark">
              <Card.Content>
                {rules.map(rule => 
                  <Toggle id={rule.id} label={rule.description} />
                )}
              </Card.Content>
            </Card>
          </>
        );
      }
    };
    fetchRules();
  }, []);

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles">
        <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Card.Body>
              <img src={image} className="my-5" />
              <Heading subtitle>
                {title}
              </Heading>
              {content}
            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0">
              {title === "Reject Confirmation" &&
                <p className="is-size-7">
                  Voting incorrectly will result in some loss<br />of staked tokens.
                </p>
              }
              {title === "Approve Confirmation" &&
                <RulesList
                  platform={platform}
                  rules={rules}
                />
              }
              <Button.Group>
                <Button color="dark" onClick={toggle}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={message || submitting}
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

export default function ApproveReject({ platform, id, providerId, fullWidth = false, onUpdate }) {
  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const togglReject = () => setShowReject(!showReject);

  return (
    <>
      <Button color="danger" fullwidth={fullWidth} onClick={togglReject}>
        Reject
      </Button>
      <Button color="primary" fullwidth={fullWidth} onClick={toggleApprove} className="ml-4">
        Approve
      </Button>

      {showApprove &&
        <Modal_
          title="Approve Confirmation"
          image={approveImg}
          platform={platform}
          toggle={toggleApprove}
          id={id}
          providerId={providerId}
          onUpdate={onUpdate}
        /> 
      }
      {showReject &&
        <Modal_
          title="Reject Confirmation"
          image={rejectImg}
          platform={platform}
          toggle={togglReject}
          id={id}
          providerId={providerId}
          onUpdate={onUpdate}
        /> 
      }
    </>
  );
};