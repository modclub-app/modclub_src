import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../../../utils/auth";
import { formatDate } from "../../../../utils/util";
import { getPohTaskDataForAdminUsers } from "../../../../utils/api";
import { Heading, Card, Modal, Notification } from "react-bulma-components";
import Userstats from "../../profile/Userstats";
import ProfileDetails from "../ProfileDetails";
import ProfilePic from "../ProfilePic";
import UserVideo from "../UserVideo";
import UserAudio from "../UserAudio";
import DrawingChallenge from "../DrawingChallenge";
import { useHistory } from "react-router-dom";

export default function PohSubmittedApplicant() {
  const { user, isAdminUser } = useAuth();
  //Need to change
  //  const { user } = useAuth();
  //  const isAdminUser = true;
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState(null);
  const history = useHistory();

  const getApplicant = async () => {
    if (!isAdminUser) history.push(`/app/poh`);

    setLoading(true);
    const res = await getPohTaskDataForAdminUsers(packageId);
    console.log({ pohPackage: res.ok });
    setContent(res.ok);
    setLoading(false);
  };

  useEffect(() => {
    user && isAdminUser && !loading && getApplicant();
  }, [isAdminUser]);

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

      <Card>
        <Card.Header>
          <Card.Header.Title>
            <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
              Submitted {formatDate(content.updatedAt, "PPpp")}
            </span>
          </Card.Header.Title>
          {/* <Progress
                value={content.votes}
                min={content.requiredVotes}
                /> */}
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
              <Heading className="mb-2">Vote Details</Heading>
              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ color: "#FFFF" }}>Modclub ID</th>
                    <th style={{ color: "#FFFF" }}>Username</th>
                    <th style={{ color: "#FFFF" }}>EmailID</th>
                    <th style={{ color: "#FFFF" }}>Vote Decision</th>
                    <th style={{ color: "#FFFF" }}>Voted At</th>
                  </tr>
                  {content.voteUserDetails.map((user, index) => (
                    <tr key={index}>
                      <td>
                        {typeof user.userModClubId == "string"
                          ? user.userModClubId
                          : user.userModClubId.toText()}
                      </td>
                      <td>{user.userUserName}</td>
                      <td>{user.userEmailId}</td>
                      <td>{Object.keys(user.userVoteDecision)[0]}</td>
                      {/* Convert nano to milli */}
                      <td>
                        {formatDate(
                          BigInt(
                            Math.floor(
                              Number(user.userVoteCreatedAt) / (1000 * 1000)
                            )
                          ),
                          "PPpp"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Footer>
          </Card.Content>
        ))}
      </Card>
    </>
  );
}
