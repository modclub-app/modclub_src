import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getPohTaskData } from '../../../utils/api';
import {
  Heading,
  Card,
  Button,
  Modal,
  Notification
} from "react-bulma-components";
import { Form } from "react-final-form";
import Toggle from "../../common/toggle/Toggle";
import Progress from "../../common/progress/Progress";
import approveImg from '../../../../assets/approve.svg';
import rejectImg from "../../../../assets/reject.svg";
import { formatDate } from "../../../utils/util";

const Modal_ = ({ toggle, title, image, children, handleSubmit }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  // const [content, setContent] = useState(<div className="loader is-loading"></div>);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState(null);

  // const onFormSubmit = async (values: any) => {
  //   console.log("FormModal values", values);
  // }

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles">
        <Modal.Card.Body>
          <img src={image} className="my-5" />
          <Heading subtitle>
            {title}
          </Heading>
          
          {children}

        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-0">
          {title === "Reject Confirmation" &&
            <p className="is-size-7">
              Voting incorrectly will result in some loss<br />of staked tokens.
            </p>
          }
          <Button.Group>
            <Button color="dark" onClick={toggle}>
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={message || submitting}
              className={submitting && "is-loading"}
              onClick={handleSubmit}
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
  console.log("profilepic data", data);

  const imageUrl = `http://localhost:8000/storage?canisterId=${data.dataCanisterId}&contentId=${data.contentId[0]}`;

  return (
    <Card.Content>
      <img src={imageUrl} alt="Image File" style={{ display: "block", margin: "auto" }} />
    </Card.Content>
  )
};

const UserVideo = ({ data }) => {
  console.log("UserVideo", data);
  const videoUrl = `http://localhost:8000/storage?canisterId=${data.dataCanisterId}&contentId=${data.contentId[0]}`;
  const phrases = ["Theta", "Gama", "Zaba", "Unicorn", "Santa", "Moon", "Chalk", "Pillow"];

  return (
    <Card.Content>
      <video width="100%" height="auto" controls>
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>

      <Card className="mt-5">
        <Card.Content className="pb-1">
          {phrases.map(phrase => (
            <Button key={phrase} className="mr-4 mb-4" style={{ width: "22%" }}>
              {phrase}
            </Button>
          ))}
        </Card.Content>
      </Card>

    </Card.Content>
  )
};

export default function Applicant() {
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState(null);

  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const togglReject = () => setShowReject(!showReject);

  const formatTitle = (challengeId) => {
    if (challengeId === "challenge-profile-details") return "Challenge: Profile Details";
    if (challengeId === "challenge-profile-pic") return "Challenge: Profile Picture";
    if (challengeId === "challenge-user-video") return "Challenge: Video";
    return challengeId;
  }

  const onFormSubmit = (values: any) => {
    console.log("onFormSubmit values", values)
  }

  const getApplicant = async () => {
    const applicant = await getPohTaskData(packageId);
    console.log("getPohTaskData res", applicant);
    setContent(applicant);
    setLoading(false);
  }

  useEffect(() => {
    getApplicant();
  }, []);

  return loading ?
    <Modal show={true} showClose={false}>
      <div className="loader is-loading p-5"></div>
    </Modal>
    :
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

      <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          
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
                <Card.Footer className="is-block" style={{ borderColor: "#000"}}>
                  {task.allowedViolationRules.map((rule, index) => (
                    <p key={rule.ruleId}>
                      {index} {rule.ruleDesc}
                    </p>
                  ))}
                </Card.Footer>
              </Card>
            </Card.Content>
          ))}

          <Card.Footer className="pt-0" style={{ border: 0 }}>
            <Button.Group>
              <Button color="danger" fullwidth onClick={togglReject}>
                Reject
              </Button>
              <Button color="primary" fullwidth onClick={toggleApprove}>
                Approve
              </Button>
            </Button.Group>
          </Card.Footer>

          {showApprove &&
            <Modal_
              title="Approve Confirmation"
              image={approveImg}
              toggle={toggleApprove}
              handleSubmit={onFormSubmit}
            >
              <p>You are confirming that this is a real human.</p>
              <p>Voting incorrectly will result in loss of some staked tokens.</p>
            </Modal_>
          }

          {showReject &&
            <Modal_
              title="Reject Confirmation"
              image={rejectImg}
              toggle={togglReject}
              handleSubmit={onFormSubmit}
            > 
              <p className="mb-3">Select which rules were broken:</p>
              <Card backgroundColor="dark">
                <Card.Content>
                  <Toggle id="reject-notsame" label="Person in picture and video are not the same" />
                  <Toggle id="reject-social" label="Social accounts do not match person" />
                  <Toggle id="reject-phrase" label="Person did not say the unique phrase" />
                  <Toggle id="reject-name" label="Person did not provide first and last name" />
                </Card.Content>
              </Card>
            </Modal_>
          }

          </form>
        )}

      />
    </Card>
};