import * as React from 'react'
import { Link, useHistory } from "react-router-dom";
import { Form, Field } from "react-final-form";
import { useEffect, useState } from "react";
import {
  Modal,
  Columns,
  Card,
  Button,
} from "react-bulma-components";
import "../adminsubmittedcontent/common/react-datetime.css";
import DatePicker from "react-datepicker";
import Userstats from "../../profile/Userstats";
import FilterBar from "./common/AdminFilterBar";
import { useAuth } from "../../../../utils/auth";
import { getAllPohTasksForAdminUsers } from "../../../../utils/api";
import { fetchObjectUrl, formatDate, getUrlForData } from "../../../../utils/util";
import { PohTaskPlusForAdmin } from "../../../../utils/types";
import placeholder from '../../../../../assets/user_placeholder.png';

const PAGE_SIZE = 100;

const ApplicantPOHDrawing = ({ applicant } : { applicant : PohTaskPlusForAdmin }) => {
  const indexForDrawingChallenge = applicant.pohTaskData.findIndex(data=>data.challengeId=='challenge-drawing');
  const imageUrl = (indexForDrawingChallenge>-1) ? getUrlForData(applicant.pohTaskData[indexForDrawingChallenge].dataCanisterId,applicant.pohTaskData[indexForDrawingChallenge].contentId[0]) : null;
  const [urlObject, setUrlObject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      /* applicant.pohTaskData[0].challengeId == 'challenge-drawing' 
        const imageUrl = getUrlForData(applicant.pohTaskData[0].dataCanisterId, applicant.pohTaskData[0].contentId[0]);
        const urlObject = await fetchObjectUrl(imageUrl);
      */
      console.log(`Applicant imageUrl: ${imageUrl}`);
      const urlObject = await fetchObjectUrl(imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
    return () => { setUrlObject(null) };
  }, [imageUrl])
  
  return (
      <img
        src={imageUrl ? urlObject : placeholder}
        alt="Image File"
        style={{
          display: "block",
          margin: "auto",
          height: 125,
          width: 125
        }}
      />
  )
};

export default function PohApplicantList() {
  const { user, isAdminUser } = useAuth();
  //Need to change
  // const { user } = useAuth();
  // const isAdminUser = true;
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Array<PohTaskPlusForAdmin>>([]);
  const [rejectedApplicants, setRejectedApplicants] = useState<Array<PohTaskPlusForAdmin>>([]);
  const [searchedApplicants, setSearchedApplicants] = useState<Array<PohTaskPlusForAdmin>>([]);
  const [isUsingSearch, setIsUsingSearch] = useState<boolean>(false);
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
    setIsUsingSearch(false);
    setCurrentFilter(filter);
    getApplicants(filter);
    setSearchedApplicants([...[]]);
  }
  const history = useHistory();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const handleStartChange = (newValue: Date | null) => {
    setStartDate(newValue);
  };
  const handleEndChange = (newValue: Date | null) => {
    setEndDate(newValue);
  };
  
  const onFormSubmit = async (values) => {
    searchUsingPIDORDate("pid",values)
  }
  const searchUsingPIDORDate = async (searchType: string,values?) => {
    setIsUsingSearch(true);
    setSubmitting(true);
    setLoading(true);
    setCurrentFilter('Search');
    const pidArr = searchType=='pid'?values.pids.split(",").map(function(item) {
      return item.trim();
    }):[];
    const stDate = searchType=='dates'? new Date(startDate).getTime():0;
    const enDate = searchType=='dates'? new Date(endDate).getTime():0;
    const status = {'approved':null};
    const newSearchedApplicants = await getAllPohTasksForAdminUsers(status, page.startIndex, page.endIndex, pidArr, stDate, enDate);
    console.log("Searched Users:", newSearchedApplicants);
    setSearchedApplicants(newSearchedApplicants);
    setLoading(false);
    setSubmitting(false);
  }
  const getApplicants = async (crrFilter) => {
    if(!isAdminUser)history.push(`/app/poh`);
    setLoading(true);
    if(crrFilter == 'Approved'){
      const status = {'approved':null};  
      const newApplicants = await getAllPohTasksForAdminUsers(status, page.startIndex, page.endIndex, []);
      console.log("Appoved users:", newApplicants);
      // const newApplicants = [{packageId:'asoidfja-asdfasdf-asdfa-ewrwer-sdfsf',status:{"approved":null},voteCount:10,profileImageUrlSuffix:"",userModClubId:'Mod-1',userUserName:'Test-1',userEmailId:'TestEmail@gmail.com',submittedAt:1659379579393,completedOn:1659389579393}];
      if (newApplicants.length < PAGE_SIZE) setHasReachedEnd(true)
      setApplicants([...applicants, ...newApplicants]);
    }else{
      const status = {'rejected':null};
      const newRejectedApplicants = await getAllPohTasksForAdminUsers(status, rejPage.startIndex, rejPage.endIndex, []);
      console.log("Rejected users:", newRejectedApplicants);
      if (newRejectedApplicants.length < PAGE_SIZE) setHasReachedEnd(true)
      setRejectedApplicants([...rejectedApplicants, ...newRejectedApplicants]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user && firstLoad && isAdminUser && !loading && !applicants.length && getApplicants('Approved')) {
      setFirstLoad(false);
    }
  }, [isAdminUser]);

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
            <Form
              onSubmit={onFormSubmit}
              render={({ handleSubmit, values }) => (
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <div className="control has-icons-left">
                      <Field
                        name="pids"
                        component="textarea"
                        type="text"
                        className="input is-medium"
                        placeholder="Comma Separated Principals"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!values.pids || submitting}
                    size="large"
                    color="primary"
                    fullwidth
                    value="submit"
                    className={submitting ? "is-loading" : ""}
                  >
                    Submit
                  </Button>
                </form>
              )}
            />
          </Columns.Column>
          <Columns.Column size={12}>
            <DatePicker
              selected={startDate}
              onChange={(date) => handleStartChange(date)}
              timeInputLabel="Start Date Time:"
              placeholderText="Start Date Time"
              dateFormat="MM/dd/yyyy h:mm aa"
              showTimeInput
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => handleEndChange(date)}
              timeInputLabel="End Date Time:"
              placeholderText="End Date Time"
              dateFormat="MM/dd/yyyy h:mm aa"
              showTimeInput
            />
            <Button
              type="button"
              disabled={!startDate || !endDate || submitting}
              size="large"
              color="primary"
              fullwidth
              className={submitting ? "is-loading" : ""}
              onClick={()=>searchUsingPIDORDate('dates')}
            >
              Date Range Search 
            </Button>
          </Columns.Column>
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
              <th style={{color:'#FFFF'}}>Profile</th>
              <th style={{color:'#FFFF'}}>Modclub ID</th>
              <th style={{color:'#FFFF'}}>Username</th>
              <th style={{color:'#FFFF'}}>EmailID</th>
              <th style={{color:'#FFFF'}}>Status</th>
              <th style={{color:'#FFFF'}}>Submission Date</th>
              <th style={{color:'#FFFF'}}>Completion Date</th>
            </tr>
            { isUsingSearch ? (
              <>
                {searchedApplicants.map((user, index) => (
                  <tr key={index}>
                    <td style={{width:'125px'}}>
                      <ApplicantPOHDrawing applicant={user} />
                    </td>
                    <td>
                      <Link to={`/app/admin/poh/${user.packageId}`} style={{color:'#FFFF'}}>
                        <strong>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</strong>
                      </Link>
                    </td>
                    <td>{user.userUserName}</td>
                    <td>{user.userEmailId}</td>
                    <td>{Object.keys(user.status)[0]}</td>
                    <td>{formatDate(user.submittedAt,'PPpp')}</td>
                    <td>{formatDate(user.completedOn,'PPpp')}</td>
                  </tr>
                ))}
              </>) :
              (
                currentFilter == 'Approved' ?(<>
                  {applicants.map((user, index) => (
                  <tr key={index}>
                    <td style={{width:'125px'}}>
                      <ApplicantPOHDrawing applicant={user} />
                    </td>
                    <td>
                      <Link to={`/app/admin/poh/${user.packageId}`} style={{color:'#FFFF'}}>
                        <strong>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</strong>
                      </Link>
                    </td>
                    <td>{user.userUserName}</td>
                    <td>{user.userEmailId}</td>
                    <td>{Object.keys(user.status)[0]}</td>
                    <td>{formatDate(user.submittedAt,'PPpp')}</td>
                    <td>{formatDate(user.completedOn,'PPpp')}</td>
                  </tr>
                  ))}</>):
                  (<>
                    {rejectedApplicants.length && rejectedApplicants.map((user, index) => (
                          <tr key={index}>
                            <td style={{width:'125px'}}>
                              <ApplicantPOHDrawing applicant={user} />
                            </td>
                            <td>
                              <Link to={`/app/admin/poh/${user.packageId}`} style={{color:'#FFFF'}}>
                                <strong>{typeof user.userModClubId == "string" ? user.userModClubId : user.userModClubId.toText()}</strong>
                              </Link>
                            </td>
                            <td>{user.userUserName}</td>
                            <td>{user.userEmailId}</td>
                            <td>{Object.keys(user.status)[0]}</td>
                            <td>{formatDate(user.submittedAt,'PPpp')}</td>
                            <td>{formatDate(user.completedOn,'PPpp')}</td>
                          </tr>
                        ))}
                  </>)
              )
            }
          </tbody>
        </table>
        </Card.Content>
        {!isUsingSearch && 
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
        }
        
      </Card>
    </>
  )
}
