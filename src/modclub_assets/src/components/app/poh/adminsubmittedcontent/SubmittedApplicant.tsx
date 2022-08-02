import * as React from 'react'
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../../../utils/auth";
import { formatDate } from "../../../../utils/util";
import { getPohTaskDataForAdminUsers } from "../../../../utils/api";
import { ViolatedRules } from '../../../../utils/types';
import { 
  Heading,
  Card,
  Button,
  Modal,
  Icon,
  Notification
} from "react-bulma-components";
import { Form, Field } from "react-final-form";
import Userstats from "../../profile/Userstats";
import ProfileDetails from "../ProfileDetails";
import ProfilePic from "../ProfilePic";
import UserVideo from "../UserVideo";
import UserAudio from "../UserAudio";
import DrawingChallenge from '../DrawingChallenge';
import { useHistory } from "react-router-dom";

export default function PohSubmittedApplicant() { 
  const { user } = useAuth();
  //Need to change
  const isAdminUser = true;
  const { packageId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState(null);
  const [formRules, setFormRules] = useState<ViolatedRules[]>([]);
  const history = useHistory();

  const getApplicant = async () => {
    if(!isAdminUser)history.push(`/app/poh`);
    
    setLoading(true)
    const res = await getPohTaskDataForAdminUsers(packageId);
    // const res = {ok:{createdAt: 1658724185497,
    // minStake: 100,
    // minVotes: 2,
    // packageId: "fx3lh-v3cir-tdsya-3nacp-ws45h-t7emc-gsrrp-o6p4o-pvoye-pcgpb-qae-poh-content-1197",
    // pohTaskData: [{challengeId: "challenge-drawing",
    // challengeType: {dl: null},
    // completedOn: 1658775260856,
    // contentId: ['903CED9D8808023924288E4D0B31425F9DB741B7DA4CCB5C89DAA72D15B1429E'],
    // createdAt: 1658724052298,
    // dataCanisterId: 'dw7z3-liaaa-aaaah-qc3ta-cai',
    // status: {rejected: null},
    // submittedAt: 1658724157219,
    // updatedAt: 1658775260856,
    // userId:'fx3lh-v3cir-tdsya-3nacp-ws45h-t7emc-gsrrp-o6p4o-pvoye-pcgpb-qae',
    // wordList: [['Square', 'Triangle', 'Star']]
    // }],
    // reward: 10,
    // updatedAt: 1658724185497,
    // voteUserDetails: [{
    //     userEmailId: "lskjdflksj@lkjsdf.com",
    //     userModClubId: 'csadh-sjf3u-zhfad-7j3su-ehbhp-qa7af-fsprs-tc2h6-tpv4t-4nabw-xae',
    //     userUserName: "YOYOYOy",
    //     userVoteCreatedAt: 1658724447117696929,
    //     userVoteDecision: {rejected: null}
    // }, {userEmailId: "lskjdflksj@lkjsdf.com",
    // userModClubId: 'csadh-sjf3u-zhfad-7j3su-ehbhp-qa7af-fsprs-tc2h6-tpv4t-4nabw-xae',
    // userUserName: "YOYOYOy",
    // userVoteCreatedAt: 1658724447117696929,
    // userVoteDecision: {rejected: null}}, {userEmailId: "lskjdflksj@lkjsdf.com",
    // userModClubId: 'csadh-sjf3u-zhfad-7j3su-ehbhp-qa7af-fsprs-tc2h6-tpv4t-4nabw-xae',
    // userUserName: "YOYOYOy",
    // userVoteCreatedAt: 1658724447117696929,
    // userVoteDecision: {rejected: null}}]}}
    console.log({pohPackage: res.ok });
    setContent(res.ok);
    setLoading(false);
  }

  useEffect(() => {
    user && !loading && getApplicant();
  }, [user]);

  const formatTitle = (challengeId) => {
    switch (challengeId) {
      case "challenge-profile-details":
        return "Profile Details"
      case "challenge-profile-pic":
        return "Profile Picture";
      case "challenge-user-video":
        return "Unique Phrase (Video)";
      case "challenge-user-audio":
        return "Unique Phrase (Audio)";
      case "challenge-drawing":
        return "Unique Drawing";
      default:
        return challengeId
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
  }

  if (!content) {
    return (
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    )
  };

  return (
    <>
      {isSafari && iOS &&
        <Notification color="danger" className="has-text-centered">
          Proof of Humanity is not working on iOS Safari
        </Notification>
      }

      <Userstats />
      
      
        <Card>
            <Card.Header>
                <Card.Header.Title>
                <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
                    Submitted {formatDate(content.updatedAt)}
                </span>
                </Card.Header.Title>
                {/* <Progress
                value={content.votes}
                min={content.minVotes}
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
                <Card.Footer backgroundColor="dark" className="is-block m-0 px-5" style={{ borderColor: "#000"}}>
                    <Heading className="mb-2">Vote Details</Heading>
                    <table className="table">
                        <tbody>
                            <tr>
                            <th style={{color:'#FFFF'}}>Modclub ID</th>
                            <th style={{color:'#FFFF'}}>Username</th>
                            <th style={{color:'#FFFF'}}>EmailID</th>
                            <th style={{color:'#FFFF'}}>Vote Decision</th>
                            <th style={{color:'#FFFF'}}>Voted At</th>
                            </tr>
                            {content.voteUserDetails.map((user, index) => (
                            <tr key={index}>
                                <td>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</td>
                                <td>{user.userUserName}</td>
                                <td>{user.userEmailId}</td>
                                <td>{Object.keys(user.userVoteDecision)[0]}</td>
                                <td>{formatDate(user.userVoteCreatedAt)}</td>
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
};