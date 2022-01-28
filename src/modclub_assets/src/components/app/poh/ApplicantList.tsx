import * as React from 'react'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Modal,
  Heading,
  Columns,
  Card,
  Button,
  Icon
} from "react-bulma-components";
import Userstats from "../profile/Userstats";
import Progress from "../../common/progress/Progress";
import { useAuth } from "../../../utils/auth";
import { getPohTasks } from "../../../utils/api";
import { formatDate, getUrlForData } from "../../../utils/util";
import { PohTaskPlus } from "../../../utils/types";

const ApplicantSnippet = ({ applicant } : { applicant : PohTaskPlus }) => {
  console.log("ApplicantSnippet", applicant);
  const { fullName, aboutUser, profileImageUrlSuffix, createdAt, reward } = applicant;
  const regEx = /canisterId=(.*)&contentId=(.*)/g;
  const match = regEx.exec(applicant.profileImageUrlSuffix[0]);
  const imageUrl = getUrlForData(match[1], match[2]);
  
  return (
    <Link
      to={`/app/poh/${applicant.packageId}`}
      className="card is-block"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,1) 70%), url(${imageUrl}) no-repeat top center`
      }}
    >
      <Card.Header justifyContent="start">
        <Progress
          value={applicant.voteCount}
          min={applicant.minVotes}
        />
      </Card.Header>

      <Card.Content style={{ paddingTop: "50%" }}>
        <Heading subtitle marginless>
          {fullName}
        </Heading>
        <p className="is-size-7 mt-2">
          {aboutUser}
        </p>
      </Card.Content>
      
      <Card.Footer className="is-block">
        <Card.Header.Title>
          <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
            Submitted {formatDate(createdAt)}
          </span>
        </Card.Header.Title>

        <Button.Group className="is-flex-wrap-nowrap mt-5">
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">local_atm</span>
            </Icon>
            <span>{"Rq Stake: " + applicant.minStake}</span>
          </Button>
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">stars</span>
            </Icon>
            <span>{"Reward: " + reward}</span>
          </Button>
        </Button.Group>
      </Card.Footer>
    </Link>
  )
};

export default function PohApplicantList() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Array<PohTaskPlus>>([])

  const getApplicants = async () => {
    setLoading(true);
    const status = { "new": null };
    const applicants = await getPohTasks(status);
    console.log("getPohTasks res", applicants);
    setApplicants(applicants);
    setLoading(false);
  }

  useEffect(() => {
    user && !loading && getApplicants();
  }, [user]);

  return !applicants ?
    <Modal show={true} showClose={false}>
      <div className="loader is-loading p-5"></div>
    </Modal>
    :
    <>
      <Userstats />

      <Columns>
        {applicants.map((applicant, index) => (
          <Columns.Column
            key={index}
            mobile={{ size: 12 }}
            tablet={{ size: 6 }}
            fullhd={{ size: 4 }}
            style={{ maxWidth: 480 }}
          >
            <ApplicantSnippet applicant={applicant} />
          </Columns.Column>
        ))}
      </Columns>
    </>
}