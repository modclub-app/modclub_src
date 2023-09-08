import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formatDate } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import {
  Heading,
  Card,
  Button,
  Modal,
  Icon,
  Notification,
} from "react-bulma-components";
import { Form, Field } from "react-final-form";
import Userstats from "../profile/Userstats";
import ProfileDetails from "./ProfileDetails";
import ProfilePic from "./ProfilePic";
import UserVideo from "./UserVideo";
import UserAudio from "./UserAudio";
import DrawingChallenge from "./DrawingChallenge";
import POHConfirmationModal from "./POHConfirmationModal";
import { useProfile } from "../../../contexts/profile";
import { useActors } from "../../../hooks/actors";

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
            color={values[id] === "confirm" && "primary"}
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
              <span className="material-icons">
                {values[id] === "confirm"
                  ? "trip_origin"
                  : "fiber_manual_record"}
              </span>
            </Icon>
            <span className="ml-1">Confirm</span>
          </Button>

          <Button
            renderAs="label"
            color={values[id] === label && "danger"}
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
              <span className="material-icons">
                {values[id] === label ? "trip_origin" : "fiber_manual_record"}
              </span>
            </Icon>
            <span className="ml-1">Reject</span>
          </Button>
        </Button.Group>
      </td>
    </>
  );
};

export default function PohApplicant() {
  const { user } = useProfile();
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState(null);
  const [formRules, setFormRules] = useState<modclub_types.ViolatedRules[]>([]);
  const { modclub } = useActors();

  const getApplicant = async () => {
    setLoading(true);
    const res = await modclub.getPohTaskData(packageId);
    console.log({ pohPackage: res.ok });
    setContent(res.ok);
    setLoading(false);
  };

  useEffect(() => {
    user && !loading && getApplicant();
  }, [user]);

  useEffect(() => {
    !formRules.length &&
      content &&
      content.pohTaskData &&
      content.pohTaskData.forEach((task) => {
        setFormRules((existingRule) => [
          ...existingRule,
          ...task.allowedViolationRules,
        ]);
      });
  }, [content]);

  const formatTitle = (challengeId) => {
    switch (challengeId) {
      case "challenge-profile-details":
        return "Profile Details";
      case "challenge-profile-pic":
        return "Profile Picture";
      case "challenge-user-video":
        return "Unique Phrase (Video)";
      case "challenge-user-audio":
        return "Unique Phrase (Audio)";
      case "challenge-drawing":
        return "Unique Drawing";
      default:
        return challengeId;
    }
  };

  const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const renderChallenge = (challengeId: String, task: any) => {
    switch (challengeId) {
      case "challenge-profile-details":
        return <ProfileDetails data={task} />;
      case "challenge-profile-pic":
        return <ProfilePic data={task} />;
      case "challenge-user-video":
        return <UserVideo data={task} />;
      case "challenge-user-audio":
        return <UserAudio data={task} />;
      case "challenge-drawing":
        return <DrawingChallenge data={task} />;
    }
  };

  if (!content) {
    return (
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    );
  }

  return (
    <>
      {isSafari && iOS && (
        <Notification color="danger" className="has-text-centered">
          Proof of Humanity is not working on iOS Safari
        </Notification>
      )}

      <Userstats />

      <Form
        onSubmit={() => {}}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Card>
              <Card.Header>
                <Card.Header.Title>
                  <span
                    style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}
                  >
                    Submitted {formatDate(content.updatedAt)}
                  </span>
                </Card.Header.Title>
              </Card.Header>

              {content.pohTaskData.map((task) => (
                <Card.Content key={task.challengeId}>
                  <Heading subtitle className="mb-3">
                    {formatTitle(task.challengeId)}
                  </Heading>
                  <Card backgroundColor="dark">
                    {renderChallenge(task.challengeId, task)}
                  </Card>
                  <Card.Footer
                    backgroundColor="dark"
                    className="is-block m-0 px-5"
                    style={{ borderColor: "#000" }}
                  >
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

              <POHConfirmationModal
                formRules={formRules}
                reward={content.reward}
              />
            </Card>
          </form>
        )}
      />
    </>
  );
}
