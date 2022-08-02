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

const PAGE_SIZE = 20;

export default function PohApplicantList() {
  const { user } = useAuth();
  //Need to change
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
      //const newApplicants = [{packageId:'asoidfja-asdfasdf-asdfa-ewrwer-sdfsf',status:{"approved":null},voteCount:10,profileImageUrlSuffix:"",userModClubId:'Mod-1',userUserName:'Test-1',userEmailId:'TestEmail@gmail.com',submittedAt:1659379579393,completedOn:1659389579393}];
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
      <Columns>
          <Columns.Column size={12}>
            <FilterBar
              isAdminUser={isAdminUser}
              filters={filters}
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          </Columns.Column>
      </Columns>
      <Card>
        <Card.Content backgroundColor="dark" className="is-block m-0 px-5" style={{ borderColor: "#000"}}>
        <table className="table">
          <tbody>
            <tr>
              <th style={{color:'#FFFF'}}>Modclub ID</th>
              <th style={{color:'#FFFF'}}>Username</th>
              <th style={{color:'#FFFF'}}>EmailID</th>
              <th style={{color:'#FFFF'}}>Status</th>
              <th style={{color:'#FFFF'}}>Submission Date</th>
              <th style={{color:'#FFFF'}}>Completion Date</th>
            </tr>
            {currentFilter == 'Approved' ?(<>
              {applicants.map((user, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/app/admin/poh/${user.packageId}`} style={{color:'#FFFF'}}>
                    <strong>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</strong>
                  </Link>
                </td>
                <td>{user.userUserName}</td>
                <td>{user.userEmailId}</td>
                <td>Approved</td>
                <td>{formatDate(user.submittedAt)}</td>
                <td>{formatDate(user.completedOn)}</td>
              </tr>
              ))}</>):
              (<>
                {rejectedApplicants.length && rejectedApplicants.map((user, index) => (
                      <tr key={index}>
                        <td>
                          <Link to={`/app/admin/poh/${user.packageId}`} style={{color:'#FFFF'}}>
                            <strong>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</strong>
                          </Link>
                        </td>
                        <td>{user.userUserName}</td>
                        <td>{user.userEmailId}</td>
                        <td>Rejected</td>
                        <td>{formatDate(user.submittedAt)}</td>
                        <td>{formatDate(user.completedOn)}</td>
                      </tr>
                    ))}
              </>)
            }
          </tbody>
        </table>
        </Card.Content>
        <Card.Footer alignItems="center">
          <div>
            Showing 1 to {currentFilter == 'Approved'?applicants.length:rejectedApplicants.length} feeds
          </div>
          <Button
            color="primary"
            onClick={() => currentFilter == 'Approved'?nextPage():nextRejPage()}
            className="ml-4 px-7 py-3"
            disabled={hasReachedEnd}
          >
            See more
          </Button>
        </Card.Footer>
      </Card>
    </>
  )
}
