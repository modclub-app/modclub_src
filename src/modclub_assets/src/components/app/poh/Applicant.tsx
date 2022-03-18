import * as React from 'react'
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../../utils/auth";
import { formatDate } from "../../../utils/util";
import { getPohTaskData } from "../../../utils/api";
import { ViolatedRules } from '../../../utils/types';
import {
  Heading,
  Card,
  Button,
  Modal,
  Icon
} from "react-bulma-components";
import { Form, Field } from "react-final-form";
import Userstats from "../profile/Userstats";
import Progress from "../../common/progress/Progress";
import ProfileDetails from "./ProfileDetails";
import ProfilePic from "./ProfilePic";
import UserVideo from "./UserVideo";
import POHConfirmationModal from "./POHConfirmationModal";

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
  const [formRules, setFormRules] = useState<ViolatedRules[]>([]);

  const getApplicant = async () => {
    setLoading(true)
    const res = await getPohTaskData(packageId);
    setContent(res.ok);
    setLoading(false);
  }

  useEffect(() => {
    user && !loading && getApplicant();
  }, [user]);

  useEffect(() => {
    !formRules.length && content && content.pohTaskData && content.pohTaskData.forEach(task => {
      setFormRules(existingRule => [...existingRule, ...task.allowedViolationRules]);
    });
  }, [content]);

  const formatTitle = (challengeId) => {
    if (challengeId === "challenge-profile-details") return "Profile Details";
    if (challengeId === "challenge-profile-pic") return "Profile Picture";
    if (challengeId === "challenge-user-video") return "Unique Phrase Video";
    return challengeId;
  };

  if (!content) {
    return (
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    )
  };

  return (
    <>
      <Userstats />
      
      <Form
        onSubmit={() => {}}
        render={({ handleSubmit, values }) => (
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
};