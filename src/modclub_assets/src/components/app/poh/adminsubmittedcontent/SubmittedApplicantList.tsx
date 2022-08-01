import * as React from 'react'
import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Modal,
  Heading,
  Columns,
  Card,
  Button,
  Icon, 
} from "react-bulma-components";
import Userstats from "../../profile/Userstats";
import FilterBar from "./common/AdminFilterBar";
import { useAuth } from "../../../../utils/auth";
import { getAllPohTasksForAdminUsers } from "../../../../utils/api";
import { fetchObjectUrl, formatDate, getUrlForData } from "../../../../utils/util";
import { PohTaskPlusForAdmin } from "../../../../utils/types";
import placeholder from '../../../../../assets/user_placeholder.png';

const PAGE_SIZE = 9;

const ApplicantSnippet = ({ applicant } : { applicant : PohTaskPlusForAdmin }) => {
  const {profileImageUrlSuffix, submittedAt, completedOn } = applicant;
  const regEx = /canisterId=(.*)&contentId=(.*)/g;
  const match = profileImageUrlSuffix.length ? regEx.exec(profileImageUrlSuffix[0]) : null;
  const imageUrl = match ? getUrlForData(match[1], match[2]) : null;
  const [urlObject, setUrlObject] = useState(null);

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
      to={`/app/admin/poh/${applicant.packageId}`}
      className="card is-flex is-flex-direction-column is-justify-content-flex-end"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 70%), url(${imageUrl ? urlObject : placeholder})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <Card.Header justifyContent="start" style={{ marginBottom: "auto", boxShadow: "none" }}>
        <strong style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0, color:'#FFFF' }}>
          {applicant.userModClubId}
        </strong>
      </Card.Header>

       <Card.Content style={{ paddingTop: "65%" }}>

      </Card.Content> 
      
      <Card.Footer className="is-block">
        <Card.Header.Title>
          <strong style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0, wordBreak: 'break-all' }}>
            {applicant.userUserName} | {applicant.userEmailId}
          </strong>
        </Card.Header.Title>

        <Button.Group className="is-flex-wrap-nowrap" style={{ paddingBottom: 10 }}>
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span>{"Submitted: " + formatDate(applicant.submittedAt)}</span>
          </Button>
        </Button.Group>
        <Button.Group className="is-flex-wrap-nowrap" style={{ paddingBottom: 10 }}>
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span>{"Completed: " + formatDate(applicant.completedOn)}</span>
          </Button>
        </Button.Group>
      </Card.Footer>
    </Link>
  )
};

export default function PohApplicantList() {
  const { user } = useAuth();
  const isAdminUser = true;
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Array<PohTaskPlusForAdmin>>([]);
  const [rejectedApplicants, setRejectedApplicants] = useState<Array<PohTaskPlusForAdmin>>([]);
  const [page, setPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE - 1
  });
  const [rejPage, setRejPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE - 1
  });
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const apps = ["Reddit", "4chan", "Medium"];
  const [currentApp, setCurrentApp] = useState<string>(null);
  const handleAppChange = (app) => {
    setCurrentApp(app)
  }

  const filters = ["Approved", "Rejected"];
  const [currentFilter, setCurrentFilter] = useState<string>("Approved");
  const handleFilterChange = (filter) => {
    // Make backend call to get content based on filter and display it.
    setCurrentFilter(filter);
    getApplicants(filter);
  }
  const history = useHistory();

  const getApplicants = async (crrFilter) => {
    if(!isAdminUser)history.push(`/app/poh`);
    setLoading(true);
    if(crrFilter == 'Approved'){
      const status = {'approved':null};  
      const newApplicants = await getAllPohTasksForAdminUsers(status, page.startIndex, page.endIndex);
      //const newApplicants = [{packageId:'asoidfja-asdfasdf-asdfa-ewrwer-sdfsf',status:{"approved":null},voteCount:10,profileImageUrlSuffix:"",userModClubId:'Mod-1',userUserName:'Test-1',userEmailId:'TestEmail@gmaul.coTestEmail@gmaul.coTestEmail@gmaul.coTestEmail@gmaul.com',submittedAt:1659389579393,completedOn:1659379579393}];
      if (newApplicants.length < PAGE_SIZE) setHasReachedEnd(true)
      setApplicants([...applicants, ...newApplicants]);
    }else{
      const status = {'rejected':null};
      const newRejectedApplicants = await getAllPohTasksForAdminUsers(status, rejPage.startIndex, rejPage.endIndex);
      if (newRejectedApplicants.length < PAGE_SIZE) setHasReachedEnd(true)
      setRejectedApplicants([...rejectedApplicants, ...newRejectedApplicants]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user && firstLoad && !loading && !applicants.length && getApplicants('Approved')) {
      setFirstLoad(false);
    }
  }, [user]);

  useEffect(() => {
    user && !loading && getApplicants('Approved');
  }, [page]);

  useEffect(() => {
    user && !loading && getApplicants('Rejected');
  }, [rejPage]);

  const nextPage = () => {
    let nextPageNum = page.page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    setPage({
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE - 1
    });
  }

  const nextRejPage = () => {
    let nextPageNum = rejPage.page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    setRejPage({
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
  if (user && applicants.length === 0 && rejectedApplicants.length === 0) {
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
    ({currentFilter == 'Approved' ?
      (<>
        <Columns>
          <Columns.Column size={12}>
            <FilterBar
              isAdminUser={isAdminUser}
              filters={filters}
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
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
      </>):
      (<>
        <Columns>
          <Columns.Column size={12}>
            <FilterBar
              isAdminUser={isAdminUser}
              filters={filters}
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          </Columns.Column>

          {rejectedApplicants.length && rejectedApplicants.map((applicant, index) => (
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
                  Showing 1 to {rejectedApplicants.length} feeds
                </div>
                <Button
                  color="primary"
                  onClick={() => nextRejPage()}
                  className="ml-4 px-7 py-3"
                  disabled={hasReachedEnd}
                >
                  See more
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>
        </Columns>
      </>)
    });
    </>
  )
}
