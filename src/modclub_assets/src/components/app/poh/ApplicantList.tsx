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
import { fetchObjectUrl, formatDate, getUrlForData } from "../../../utils/util";
import { PohTaskPlus } from "../../../utils/types";

const PAGE_SIZE = 3;

const ApplicantSnippet = ({ applicant } : { applicant : PohTaskPlus }) => {
  const { userName, fullName, aboutUser, profileImageUrlSuffix, createdAt, reward } = applicant;
  const regEx = /canisterId=(.*)&contentId=(.*)/g;
  const match = regEx.exec(profileImageUrlSuffix[0]);
  const imageUrl = getUrlForData(match[1], match[2]);
  const [urlObject, setUrlObject] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
    return () => { setUrlObject(null) };
  }, [])   
  
  return (
    <Link
      to={`/app/poh/${applicant.packageId}`}
      className="card is-flex is-flex-direction-column is-justify-content-flex-end"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 70%), url(${urlObject})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <Card.Header justifyContent="start" style={{ marginBottom: "auto", boxShadow: "none" }}>
        <Progress
          value={applicant.voteCount}
          min={applicant.minVotes}
        />
      </Card.Header>

      <Card.Content style={{ paddingTop: "65%" }}>
        <Heading subtitle marginless>
          {userName[0]}
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

        <Button.Group className="is-flex-wrap-nowrap mt-5" style={{ paddingBottom: 10 }}>
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
  // const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Array<PohTaskPlus>>([])
  const [page, setPage] = useState(1);

  const getApplicants = async () => {
    // if (!user) return
    setLoading(true);
    const status = { "new": null };
    // const applicants = await getPohTasks(status, PAGE_SIZE, page);
    // console.log("getPohTasks res", applicants);
    // setApplicants(applicants);
    console.log("getApplicants user", user)
    const newApplicants = await getPohTasks(status, applicants.length, applicants.length);
    console.log('newApplicants res', newApplicants);
    setApplicants([...applicants, ...newApplicants]);
    setLoading(false);
  }

  useEffect(() => {
    user && !loading && getApplicants();
  }, [user]);

  // useEffect(() => {
  //   // console.log("isAuthenticated useEffect isAuthenticated", isAuthenticated)
  //   // console.log("isAuthenticated useEffect user", user)
  //   isAuthenticated && getApplicants();
  // }, [isAuthenticated]);

  useEffect(() => {
    console.log("call getApplicants from page user", user)
    user && getApplicants();
  }, [page]);

  // useEffect(() => {
  //   const getApplicants = async () => {
  //     setLoading(true);
  //     const status = { "new": null };
  //     const newApplicants = await getPohTasks(status, PAGE_SIZE, page);
  //     console.log('newApplicants res', newApplicants);
  //     setApplicants([...applicants, ...newApplicants]);
  //     setLoading(false);
  //   };
  //   user && !loading && getApplicants();
  //   // user && getApplicants();
  // }, [user, page]);

  if (loading) {
    return (
      <Modal show={true} showClose={false}>
      <div className="loader is-loading p-5"></div>
      </Modal>
    )
  }
  if (user && applicants.length === 0) {
    return (
      <section className="hero is-black is-medium">
        <div className="hero-body container has-text-centered">
          <p className="has-text-silver is-size-4 has-text-centered mb-6">
            There are no proof of humanity applicants at the moment.
          </p>
        </div>
      </section>
    )
  }
  return(
    <>
      <Userstats />

      <Columns>
        {applicants.length && applicants.map((applicant, index) => (
          <Columns.Column
            key={applicant.packageId}
            mobile={{ size: 11 }}
            tablet={{ size: 6 }}
            fullhd={{ size: 4 }}
          >
            <ApplicantSnippet applicant={applicant} />
          </Columns.Column>
        ))}
        <Columns.Column size={12}>
          <Card>
            <Card.Footer alignItems="center">
              <div>
                Showing 1 to {Math.min(page * PAGE_SIZE, applicants.length)} of{" "}
                {applicants.length} feeds
              </div>
              <Button
                color="primary"
                onClick={() => setPage(page + 1)}
                className="ml-4 px-7 py-3"
                // disabled={page * PAGE_SIZE > applicants.length}
              >
                See more
              </Button>
            </Card.Footer>
          </Card>
        </Columns.Column>
      </Columns>
    </>
  )
}