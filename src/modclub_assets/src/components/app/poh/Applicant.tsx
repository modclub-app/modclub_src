import * as React from 'react'
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../../utils/auth";
import { formatDate, getUrlForData, getViolatedRules, fetchObjectUrl } from "../../../utils/util";
import { getPohTaskData, votePohContent } from "../../../utils/api";
import {
  Heading,
  Card,
  Columns,
  Button,
  Modal,
  Notification,
  Icon
} from "react-bulma-components";
import { Form, Field } from "react-final-form";
import Userstats from "../profile/Userstats";
import Confirm from "../../common/confirm/Confirm";
import Progress from "../../common/progress/Progress";
import approveImg from "../../../../assets/approve.svg";
import rejectImg from "../../../../assets/reject.svg";
import { PohRulesViolated, ViolatedRules } from '../../../utils/types';

const Modal_ = ({ toggle, title, image, children, packageId, values }) => {
  const [submitting, setSubmitting] = useState(null);
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

  const onFormSubmit = async (values: {[key: string]: string}) => {
    const rules = getViolatedRules(values).map(rule => {
      let result: PohRulesViolated = {
        ruleId: rule.slice(-1),
        challengeId: rule.substring(0, rule.length - 2)
      };
      return result;
    });
    
    try {
      setSubmitting(true);
      const result = await votePohContent(packageId, title === "Approve Confirmation" ? { approved: null } : { rejected: null }, rules);
      setMessage({ success: true, value: "Vote submitted successfully" });
      setSubmitting(false);
      toggle();
    } catch (e) {
      const regEx = /Reject text: (.*)/g;
      let errAr = regEx.exec(e.message);
      errAr ? setMessage({ success: false, value: errAr[1] }) : setMessage({ success: false, value: e });
      setSubmitting(false);
    }
  }

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles">
        <Modal.Card.Body>
          <img src={image} className="my-5" />
          <Heading subtitle>
            {title}
          </Heading>
          
          {children}

          <Confirm
            type="danger"
            id="voteIncorrectlyConfirmation"
            label={`I understand I will lose 5 MOD if I vote incorrectly`}
          />

        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-0" justifyContent="flex-end">
          <Button.Group>
            <Button color="dark" onClick={toggle}>
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isDisabled(values)}
              className={submitting && "is-loading"}
              onClick={() => onFormSubmit(values)}
            >
              Submit
            </Button>
          </Button.Group>
        </Modal.Card.Footer>
      </Modal.Card>

      {message &&
        <Notification color={message.success ? "success" : "danger"} textAlign="center">
          {message.value}
        </Notification>
      }
    </Modal>
  );
};

const ProfileDetails = ({ data }) => {
  return (
    <Card.Content>
      <table className="table is-label">
        <tbody>
        <tr>
            <td>Username:</td>
            <td>{data.userName}</td>
          </tr>
          <tr>
            <td>Full Name:</td>
            <td>{data.fullName}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{data.email}</td>
          </tr>
          <tr>
            <td>About bio:</td>
            <td>{data.aboutUser}</td>
          </tr>
        </tbody>
      </table>
    </Card.Content>
  )
};

const ProfilePic = ({ data }) => {
  const imageUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const [urlObject, setUrlObject] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
  }, [])  

  return (
    <Card.Content>
      <img src={urlObject} alt="Image File" style={{ display: "block", margin: "auto" }} />
    </Card.Content>
  )
};

const UserVideo = ({ data }) => {
  const videoUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const phrases = data.wordList[0]
  const [videoObject, setVideoObject] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(videoUrl);
      setVideoObject(urlObject);
    };
    fetchData();
  }, [])  

  return (
    <Card.Content>
      {videoObject &&
        <video width="100%" height="auto" controls>
          <source src={videoObject} />
          Your browser does not support the video tag.
        </video>
      }

      <Card className="mt-5">
        <Card.Content className="columns is-multiline">
          {phrases.map((phrase, index) => (
            <Columns.Column key={phrase} size={4}>
              <Button fullwidth isStatic>
                {index + 1} <span className="ml-2">{phrase}</span>
              </Button>
            </Columns.Column>
          ))}
        </Card.Content>
      </Card>

    </Card.Content>
  )
};

const CheckBox = ({ id, label, values }) => {
  return (
    <>
      <td className="has-text-left has-text-white has-text-weight-medium">
        {label}
      </td>
      <td>
        <Button.Group justifyContent="flex-end">
          <Button
            renderAs="label"
            color={values[id] === "confirm" && "primary" }
            className="is-size-7 has-text-weight-normal"
            style={{ paddingLeft: 6, borderColor: "white", borderRadius: 3 }}
          >
            <Field
              name={id}
              component="input"
              type="radio"
              value="confirm"
              id={id}
              checked={values[id] === "confirm"}
              style={{ display: "none" }}
            />
            <Icon color="white" size="small">
              <span className="material-icons">{values[id] === "confirm" ? "trip_origin" : "fiber_manual_record"}</span>
            </Icon>
            <span className="ml-1">Confirm</span>
          </Button>

          <Button
            renderAs="label"
            color={values[id] === label && "danger" }
            className="is-size-7 has-text-weight-normal"
            style={{ paddingLeft: 6, borderColor: "white", borderRadius: 3 }}
          >
            <Field
              name={id}
              component="input"
              type="radio"
              value={label}
              id={id}
              checked={values[id] === label}
              style={{ display: "none" }}
            />
            <Icon color="white" size="small">
              <span className="material-icons">{values[id] === label ? "trip_origin" : "fiber_manual_record"}</span>
            </Icon>
            <span className="ml-1">Reject</span>
          </Button>
        </Button.Group>
      </td>
    </>
  )
}

export default function PohApplicant() {
  const { user } = useAuth();
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState(null);

  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const toggleReject = () => setShowReject(!showReject);

  const getApplicant = async () => {
    setLoading(true)
    const res = await getPohTaskData(packageId);
    setContent(res.ok);
    setLoading(false);
  }

  useEffect(() => {
    user && !loading && getApplicant();
  }, [user]);

  const formatTitle = (challengeId) => {
    if (challengeId === "challenge-profile-details") return "Profile Details";
    if (challengeId === "challenge-profile-pic") return "Profile Picture";
    if (challengeId === "challenge-user-video") return "Unique Phrase Video";
    return challengeId;
  }

  const isDisabled = (values: any) => {
    const checked = Object.keys(values).filter(rule =>
      rule != "voteIncorrectlyConfirmation" && rule != "voteRulesConfirmation"
    )
    let formRules = [];
    content.pohTaskData.forEach(task => formRules.push(...task.allowedViolationRules));
    return checked.length === formRules.length ? false : true;
  }

  const parentSubmit = (values: any) => {
    const filteredValues = Object.values(values).filter(value => typeof value === "string");
    const confirmed = Object.values(values).filter(value => value === "confirm");
    filteredValues.length === confirmed.length ? toggleApprove() : toggleReject();
  }

  return !content ?
    <Modal show={true} showClose={false}>
      <div className="loader is-loading p-5"></div>
    </Modal>
    :
    <>
      <Userstats />
      
      <Form onSubmit={parentSubmit} render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
                  Submitted {formatDate(content.updatedAt)}
                </span>
              </Card.Header.Title>
              <Progress
                value={content.votes}
                min={content.minVotes}
              />
            </Card.Header>

            {content.pohTaskData.map((task) => (
              <Card.Content key={task.challengeId}>
                <Heading subtitle className="mb-3">
                  {formatTitle(task.challengeId)}
                </Heading>
                <Card backgroundColor="dark">
                  {task.challengeId == "challenge-profile-details" &&
                    <ProfileDetails data={task} />
                  }
                  {task.challengeId == "challenge-profile-pic" &&
                    <ProfilePic data={task} />
                  }
                  {task.challengeId == "challenge-user-video" &&
                    <UserVideo data={task} />
                  }
                </Card>
                <Card.Footer backgroundColor="dark" className="is-block m-0 px-5" style={{ borderColor: "#000"}}>
                  <table className="table has-text-left">
                    <tbody>
                      {task.allowedViolationRules.map((rule, index) => (
                        <tr key={index}>
                          <CheckBox
                            key={rule.ruleId}
                            id={`${task.challengeId}-${rule.ruleId}`}
                            label={rule.ruleDesc}
                            values={values}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card.Footer>
              </Card.Content>
            ))}

            <Card.Footer className="pt-0" style={{ border: 0 }}>
              <Button
                size="large"
                color="primary"
                disabled={isDisabled(values)}
                style={{ width: 320, margin: "auto" }}
              >
                Submit
              </Button>
            </Card.Footer>

            {showApprove &&
              <Modal_
                title="Approve Confirmation"
                image={approveImg}
                toggle={toggleApprove}
                packageId={packageId}
                values={values}
              >
                <p>You are confirming that this is a real human.</p>
                <p>Voting incorrectly will result in loss of some staked tokens.</p>
                <Confirm
                  type="warning"
                  id="voteRulesConfirmation"
                  label="I confirm that this is a real person"
                />
              </Modal_>
            }

            {showReject &&
              <Modal_
                title="Reject Confirmation"
                image={rejectImg}
                toggle={toggleReject}
                packageId={packageId}
                values={values}
              > 
                <p className="mb-3">These are the failed requirements you selected:</p>
                <Card backgroundColor="dark">
                  <Card.Content>
                    <ul>
                      {Object.keys(values).map((key, index) => (
                        values[key] != "confirm" && key != "voteIncorrectlyConfirmation" && key != "voteRulesConfirmation" && 
                        <li key={index}>
                          {index + 1}. {values[key]}
                        </li>
                      ))}
                    </ul>
                  </Card.Content>
                </Card>
              </Modal_>
            }
          </Card>
        </form>
      )}
    />
  </>
};