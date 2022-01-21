import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getPohTaskData, votePohContent } from "../../../utils/api";
import { getChecked } from "../../../utils/util";
import {
  Heading,
  Card,
  Columns,
  Button,
  Modal,
  Notification
} from "react-bulma-components";
import { Form } from "react-final-form";
import Userstats from "../profile/Userstats";
import Toggle from "../../common/toggle/Toggle";
import Confirm from "../../common/confirm/Confirm";
import Progress from "../../common/progress/Progress";
import approveImg from "../../../../assets/approve.svg";
import rejectImg from "../../../../assets/reject.svg";
import { formatDate } from "../../../utils/util";

const Modal_ = ({ toggle, title, image, children, packageId, values }) => {
  const type = title === "Approve Confirmation" ? "approved" : "rejected";

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

  const onFormSubmit = async (decision: string, values: any) => {
    console.log("onFormSubmit values !!!", values)
    const checked = getChecked(values);

    try {

      setSubmitting(true);
      // @ts-ignore
      const result = await votePohContent(packageId, { [decision]: null }, checked);
      console.log("result", result);
      setSubmitting(false);

    } catch (e) {
      console.log("e", e);

      const regEx = /Reject text: (.*)/g;
      let errAr = regEx.exec(e.message);
      console.log("errAr", errAr);
      setMessage({ success: false, value: errAr[1] });
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
              onClick={() => onFormSubmit(type, values)}
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
  const imageUrl = `http://localhost:8000/storage?canisterId=${data.dataCanisterId}&contentId=${data.contentId[0]}`;

  return (
    <Card.Content>
      <img src={imageUrl} alt="Image File" style={{ display: "block", margin: "auto" }} />
    </Card.Content>
  )
};

const UserVideo = ({ data }) => {
  const videoUrl = `http://localhost:8000/storage?canisterId=${data.dataCanisterId}&contentId=${data.contentId[0]}`;
  const phrases = data.wordList[0]

  return (
    <Card.Content>
      <video width="100%" height="auto" controls>
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>

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

export default function PohApplicant() {
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState(null);

  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const togglReject = () => setShowReject(!showReject);

  const getApplicant = async () => {
    const applicant = await getPohTaskData(packageId);
    console.log("getPohTaskData res", applicant);
    setContent(applicant);
    setLoading(false);
  }

  useEffect(() => {
    getApplicant();
  }, []);

  const formatTitle = (challengeId) => {
    if (challengeId === "challenge-profile-details") return "Challenge: Profile Details";
    if (challengeId === "challenge-profile-pic") return "Challenge: Profile Picture";
    if (challengeId === "challenge-user-video") return "Challenge: Video";
    return challengeId;
  }

  const showModal = (type: string, values: any) => {
    const checked = getChecked(values);

    if (type === "approve") {
      if (checked.length) {
        setMessage({ success: false, value: "You can not approve with any rules checked." });
      } else {
        toggleApprove();
      }
    }

    if (type === "reject") {
      if (!checked.length) {
        setMessage({ success: false, value: "You can not reject without any rules checked." });
      } else {
        togglReject();
      }
    }

    setTimeout(() => {
      setMessage(null);
    }, 2000);
  }

  const parentSubmit = () => {}

  return loading ?
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
                  {/* Submitted {formatDate(createdAt)} */}
                  Submitted todo Date()
                </span>
              </Card.Header.Title>
              <Progress
                value={5}
                min={10}
              />
            </Card.Header>

            {content.ok.map((task) => (
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
                  {task.allowedViolationRules.map(rule => (
                    <Toggle key={rule.ruleId} id={`${task.challengeId}-${rule.ruleId}`} label={rule.ruleDesc} />
                  ))}
                </Card.Footer>
              </Card.Content>
            ))}

            <Card.Footer className="pt-0" style={{ border: 0 }}>
              <Button.Group>
                <Button
                  color="danger"
                  fullwidth
                  onClick={() => showModal("reject", values)}
                  renderAs="a"
                >
                  Reject
                </Button>
                <Button
                  color="primary"
                  fullwidth
                  onClick={() => showModal("approve", values)}
                  renderAs="a"
                >
                  Approve
                </Button>
              </Button.Group>
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
                toggle={togglReject}
                packageId={packageId}
                values={values}
              > 
                <p className="mb-3">You have selected the following rules:</p>
                <Card backgroundColor="dark">
                  <Card.Content>
                    <ul>
                      {Object.keys(values).map((key, i) => (
                        values[key].length > 0 && values[key][0] != "voteIncorrectlyConfirmation" &&
                          <li key={i}>
                            {i + 1}. {values[key]}
                          </li>
                        )
                      )}
                    </ul>
                  </Card.Content>
                </Card>
              </Modal_>
            }
          </Card>
        </form>
      )}
    />

    {message &&
      <Notification color={message.success ? "success" : "danger"} textAlign="center">
        {message.value}
      </Notification>
    }
  </>
};