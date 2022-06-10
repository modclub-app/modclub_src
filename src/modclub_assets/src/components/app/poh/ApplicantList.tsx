import * as React from 'react'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Modal,
  Heading,
  Columns,
  Card,
  Button,
  Icon,
  Dropdown
} from "react-bulma-components";
import Userstats from "../profile/Userstats";
import Progress from "../../common/progress/Progress";
import { useAuth } from "../../../utils/auth";
import { getPohTasks } from "../../../utils/api";
import { fetchObjectUrl, formatDate, getUrlForData } from "../../../utils/util";
import { PohTaskPlus } from "../../../utils/types";

const PAGE_SIZE = 9;

const ApplicantSnippet = ({ applicant } : { applicant : PohTaskPlus }) => {
  const { userName, fullName, aboutUser, profileImageUrlSuffix, createdAt, reward } = applicant;
  const regEx = /canisterId=(.*)&contentId=(.*)/g;
  const match = profileImageUrlSuffix.length ? regEx.exec(profileImageUrlSuffix[0]) : null;
  const imageUrl = match ? getUrlForData(match[1], match[2]) : null;
  const [urlObject, setUrlObject] = useState(null);
  const placeholder = '../assets/user_placeholder.png'

  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
    return () => { setUrlObject(null) };
  }, [imageUrl])
  
  return (
    <Link
      to={`/app/poh/${applicant.packageId}`}
      className="card is-flex is-flex-direction-column is-justify-content-flex-end"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 70%), url(${imageUrl ? urlObject : placeholder})`,
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
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Array<PohTaskPlus>>([])
  const [page, setPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE - 1
  });
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const [currentFilter, setCurrentFilter] = useState<string>("All");
  const filters = ["All", "Newest", "Most Voted", "Less Voted"];

  const getApplicants = async () => {
    setLoading(true);
    const status = { "new": null };    
    const newApplicants = await getPohTasks(status, page.startIndex, page.endIndex);
    console.log("newApplicants", newApplicants);
    if (newApplicants.length < PAGE_SIZE) setHasReachedEnd(true)
    setApplicants([...applicants, ...newApplicants]);
    setLoading(false);
  }

  useEffect(() => {
    if (user && firstLoad && !loading && !applicants.length && getApplicants()) {
      setFirstLoad(false);
    }
  }, [user]);

  useEffect(() => {
    user && !loading && getApplicants();
  }, [page]);

  const nextPage = () => {
    let nextPageNum = page.page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    setPage({
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE - 1
    });
  }

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
        <Columns.Column size={12}>
          <Card>
            <Card.Content className="level is-justify-content-flex-start">

              <p className="has-text-light mr-5">
                Choose your favorite app:
              </p>

              <Dropdown
                className="mr-5"
                right
                label="All Apps"
                icon={
                  <Icon color="white">
                    <span className="material-icons">expand_more</span>
                  </Icon>
                }
                style={{ width: 100 }}
              >
              </Dropdown>

              <Dropdown
                className="is-hidden-tablet"
                right
                label="Filter"
                icon={
                  <Icon color="white">
                    <span className="material-icons">expand_more</span>
                  </Icon>
                }
                style={{ width: 100 }}
              >
                {filters.map(filter => 
                  <Dropdown.Item
                    key={filter}
                    value={filter}
                    renderAs="a"
                    className={currentFilter === filter && "is-active"}
                    onMouseDown={() => setCurrentFilter(filter)}
                  >
                    {filter}
                  </Dropdown.Item>
                )}
              </Dropdown>

              <Button.Group className="is-hidden-mobile">
                {filters.map(filter => 
                  <Button
                    key={filter}
                    color={currentFilter === filter ? "primary" : "ghost"}
                    className="has-text-white mr-0"
                    onClick={() => setCurrentFilter(filter)}
                  >
                    {filter}
                  </Button>
                )}
              </Button.Group>

            </Card.Content>
          </Card>
        </Columns.Column>

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
                Showing 1 to {applicants.length} feeds
              </div>
              <Button
                color="primary"
                onClick={() => nextPage()}
                className="ml-4 px-7 py-3"
                disabled={hasReachedEnd}
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