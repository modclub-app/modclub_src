import { Principal } from "@dfinity/principal";
// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent, getProvider } from "../../../utils/api";
import { Columns, Card, Button, Progress, Media, Image, Modal, Heading, Notification } from "react-bulma-components";
import { Form, Field } from "react-final-form";
import Userstats from "../userstats/Userstats";
import Platform from "../platform/Platform";
import approveImg from '../../../../assets/approve.svg';
import rejectImg from "../../../../assets/reject.svg";

const Modal_ = ({ toggle, title, image, children }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  // const [content, setContent] = useState(<div className="loader is-loading"></div>);
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
  }

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
              
              {children}

            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0">
              {title === "Reject Confirmation" &&
                <p className="is-size-7">
                  Voting incorrectly will result in some loss<br />of staked tokens.
                </p>
              }
              {/* {title === "Approve Confirmation" &&
                <RulesList
                  platform={platform}
                  rules={rules}
                />
              } */}
              <Button.Group>
                <Button color="dark" onClick={toggle}>
                  Cancel
                </Button>
                <Button color="primary" disabled={message || submitting}>
                  {submitting ? (
                    <>
                      <span className="icon mr-2 loader is-loading"></span>
                      <span>SUBMITTING...</span>
                    </>
                    ) : "Submit"
                  }
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


const Form_ = () => {
  const [showApprove, setShowApprove] = useState(false);
  const toggleApprove = () => setShowApprove(!showApprove);

  const [showReject, setShowReject] = useState(false);
  const togglReject = () => setShowReject(!showReject);


  const onFormSubmit = (values: any) => {
    console.log("onFormSubmit values", values)
  }

  const phrases = ["Theta", "Gama", "Zaba", "Unicorn", "Santa", "Moon", "Chalk", "Pillow"]

  return (
    <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
      <form onSubmit={handleSubmit}>
        <Card.Content>
          <Heading subtitle className="mb-3">
            Part 1
          </Heading>

          <Card backgroundColor="dark">
            <Card.Content>
              <Media>
                <Media.Item renderAs="figure" align="left">
                  <Image
                    size={128}
                    src="https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                  />
                </Media.Item>
                <Media.Item>
                  <table className="table is-label">
                    <tbody>
                      <tr>
                        <td>First Name:</td>
                        <td>Adam</td>
                      </tr>
                      <tr>
                        <td>Middle Name:</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Last Name:</td>
                        <td>Smith</td>
                      </tr>
                      <tr>
                        <td>About bio:</td>
                        <td>Actor, Skier and personal chef. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</td>
                      </tr>
                      <tr>
                        <td>Social links:</td>
                        <td>
                          <p>http://facebook.com/adamsmith</p>
                          <p>http://linkedin.com/in/adamsmith</p>
                          <p>http://example.com/adam</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Media.Item>
              </Media>
            </Card.Content>
            <Card.Footer className="is-block" style={{ borderColor: "#000"}}>

              <div className="field level is-relative is-toggle">
                <Field
                  name="facing"
                  component="input"
                  type="checkbox"
                  value="facing"
                  className="custom-control-input"
                  id="facing"
                />
                <label htmlFor="facing" className="is-clickable" style={{ width: "90%" }}>
                  1. In profile photo the person should be facing the camera directly
                </label>
              </div>

              <div className="field level is-relative is-toggle">
                <Field
                  name="lit"
                  component="input"
                  type="checkbox"
                  value="lit"
                  className="custom-control-input"
                  id="lit"
                />
                <label htmlFor="lit" className="is-clickable" style={{ width: "90%" }}>
                  2. In the profile photo the person should be well list so you can see their face clearly
                </label>
              </div>

              <div className="field level is-relative is-toggle">
                <Field
                  name="social"
                  component="input"
                  type="checkbox"
                  value="social"
                  className="custom-control-input"
                  id="social"
                />
                <label htmlFor="social" className="is-clickable" style={{ width: "90%" }}>
                  3. The users social account information should match the information the user provided. ( Name, last name, Same person )
                </label>
              </div>

            </Card.Footer>
          </Card>

          <Heading subtitle className="mb-3 mt-6">
            Part 2
          </Heading>

          <Card backgroundColor="dark">
            <Card.Content>
              <Image src="https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg" />

              <Card className="my-5">
                <Card.Content className="pb-1">
                  {phrases.map((phrase) => (
                    <Button className="mr-4 mb-4" style={{ width: "22%" }}>
                      {phrase}
                    </Button>
                  ))}
                </Card.Content>
              </Card>

              <div className="field level is-relative is-toggle">
                <Field
                  name="video"
                  component="input"
                  type="checkbox"
                  value="video"
                  className="custom-control-input"
                  id="video"
                />
                <label htmlFor="video" className="is-clickable" style={{ width: "90%" }}>
                  1. Confirm the person in the profile photo matches the person in the video.
                </label>
              </div>

              <div className="field level is-relative is-toggle">
                <Field
                  name="phrase"
                  component="input"
                  type="checkbox"
                  value="phrase"
                  className="custom-control-input"
                  id="phrase"
                />
                <label htmlFor="phrase" className="is-clickable" style={{ width: "90%" }}>
                  2. Confirm that the person in the video sayes each of the words in the unique phrase.
                </label>
              </div>

            </Card.Content>
          </Card>
        </Card.Content>

        <Card.Footer className="pt-0" style={{ border: 0 }}>
          <Button color="danger" fullwidth onClick={togglReject}>
            Reject
          </Button>
          <Button color="primary" fullwidth onClick={toggleApprove}>
            Approve
          </Button>

          {/* <ApproveRejectVerification /> */}

        </Card.Footer>

        {showApprove &&
          <Modal_
            title="Approve Confirmation"
            image={approveImg}
            toggle={toggleApprove}
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
          >
            <div className="field level is-relative is-toggle">
              <Field
                name="reject-notsame"
                component="input"
                type="checkbox"
                value="phrase"
                className="custom-control-input"
                id="phrase"
              />
              <label htmlFor="phrase" className="is-clickable">
                Person in picture and video are not the same
              </label>
            </div>

            <div className="field level is-relative is-toggle">
              <Field
                name="reject-social"
                component="input"
                type="checkbox"
                value="phrase"
                className="custom-control-input"
                id="phrase"
              />
              <label htmlFor="phrase" className="is-clickable" >
                Social accounts do not match person
              </label>
            </div>

            <div className="field level is-relative is-toggle">
              <Field
                name="reject-phrase"
                component="input"
                type="checkbox"
                value="phrase"
                className="custom-control-input"
                id="phrase"
              />
              <label htmlFor="phrase" className="is-clickable" >
                Person did not say the unique phrase
              </label>
            </div>

            <div className="field level is-relative is-toggle">
              <Field
                name="reject-name"
                component="input"
                type="checkbox"
                value="phrase"
                className="custom-control-input"
                id="phrase"
              />
              <label htmlFor="phrase" className="is-clickable" >
                Person did not provide first and last name
              </label>
            </div>

          </Modal_>
        }
      </form>
      )}
    />
  );
};

export default function Verification() {
  const [content, setContent] = useState(null);
  const { verificationId } = useParams();

  const renderContent = async () => {}

  useEffect(() => {
    // renderContent();
  }, []);

  return (
    <>
      <Userstats />

      <Columns>
        <Columns.Column>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                providerName
                <span>
                  Submitted by sourceId 38 min ago
                </span>
              </Card.Header.Title>
              <Progress value={15} max={100} />
              <span className="progress-label">
                {`${5}/${10} votes`}
              </span>
            </Card.Header>

            <Form_ />
          </Card>

        </Columns.Column>

        <Columns.Column size={4}>
          {/* <Platform providerId={content.providerId} />  */}
        </Columns.Column>
      </Columns>
    </>
  )
}