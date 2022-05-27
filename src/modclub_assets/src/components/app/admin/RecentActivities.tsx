import * as React from 'react'
import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { fetchProviderContent } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import {
  Columns,
  Card,
  Heading,
  Button,
  Dropdown,
  Icon
} from "react-bulma-components";
import Snippet from "../../common/snippet/Snippet";
import Progress from "../../common/progress/Progress";
import { ContentPlus } from "../../../utils/types";
const Table = (
  {
    loading,
    filteredActivity,
    getLabel,
    currentFilter
  }: {
      loading: Boolean
      filteredActivity: ContentPlus[]
      getLabel: (activity: string) => string
      currentFilter: string
    }
) => {
  if (loading) {
    return (<div className="loader is-loading"></div>);
  } else {
    return (
      <div className="table-container">
        <table className="table is-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Voted</th>
              <th>App</th>
              <th>Title</th>
              <th>Votes</th>
              <th>Voted on</th>
              <th>Reward</th>
              <th>Reward Release</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivity.length ? (
              filteredActivity.map(item => (
                <tr key={item.id}>
                  <td>
                  <Link to={`/app/tasks/${item.id}`} style={{color:"#c4c4c4"}} >
                    <Snippet string={item.id} truncate={20} />
                  </Link>
                  </td>
                  <td>
                    {("new" in item.status) ? "In Progress" : "approved" in item.status ? "Approved" : "Rejected" }
                  </td>
                  <td>{item.providerName}</td>
                  <td>
                    <Snippet string={item.title[0]} truncate={15} />
                  </td>
                  <td>
                    <Progress
                      value={Number(item.voteCount)}
                      min={Number(("new" in item.status) ? item.minVotes : item.voteCount)}
                      gradient={true}
                      />
                    {/* style={{"border-radius: 5px","background: -webkit-linear-gradient(right,#3d52fa, #c91988)"}} */}
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>20</td>
                  <td>{formatDate(item.updatedAt)}</td>
                </tr>
              )
            )
          ) : (
            <tr className="is-relative">
              <td colSpan={8}>
                No {getLabel(currentFilter)} Activity
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }

}


export default function AdminActivity() {
  const { selectedProvider } = useAuth();
  const [approvedActivity,setApprovedActivity] = useState([]);
  const [inProgressActivity,setInProgressActivity] = useState([]);
  const [rejectedActivity,setRejectedActivity] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");
  const filters = ["approved", "new", "rejected"];
  const PAGE_SIZE = 20;
  const parentPageObj = {
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE
  };
  const [page, setPage] = useState({
    "approved":{...parentPageObj},
    "new":{...parentPageObj},
    "rejected":{...parentPageObj},
  });
  const [hasReachedEnd, setHasReachedEnd] = useState({
    "approved":false,
    "new":false,
    "rejected":false
  });

  const history = useHistory();
  if(!selectedProvider){
    history.push('/app');
  }
  const getLabel = (label: string) => {
    if (label === "new") return "In Progress"
    if (label === "approved") return "Approved"
    if (label === "rejected") return "Rejected"
  }

  const getProviderContent = async (selectedProvider,selectedFilter) => {
    let status = {};
    status[selectedFilter] = null;
    const startIndex = page[selectedFilter].startIndex;
    const endIndex = page[selectedFilter].endIndex;

    let providerContents = hasReachedEnd[selectedFilter] ? []:await fetchProviderContent(selectedProvider.id,status,startIndex,endIndex);
    if (providerContents.length < PAGE_SIZE) {
      status[selectedFilter] = true;
      setHasReachedEnd({...hasReachedEnd,...status});
    }
    setLoading(true);

    switch (selectedFilter) {
      case "new":
        if(providerContents.length>0) setInProgressActivity([...inProgressActivity,...providerContents]);
        break;
      case "approved":
        if(providerContents.length>0) setApprovedActivity([...approvedActivity,...providerContents]);
        break;
      case "rejected":
        if(providerContents.length>0) setRejectedActivity([...rejectedActivity,...providerContents]);
        break;
      default:
        if(providerContents.length>0) setInProgressActivity([...inProgressActivity,...providerContents]);
        break;
    };
    setLoading(false);
  };

  const nextPage = () => {
    let nextPageNum = page[currentFilter].page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    page[currentFilter] = {
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE
    };
    setPage({...page,...page});
    selectedProvider && !loading && getProviderContent(selectedProvider,currentFilter);
  };


  useEffect(() => {
    if(selectedProvider){
      getProviderContent(selectedProvider,"new");
    }
  }, [selectedProvider]);

  return (
    <>
        <Columns>

          <Columns.Column size={12}>
            <Card>
              <Card.Content className="level">
                <Heading marginless>
                  Recent Activity
                </Heading>

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
                      onClick={() => {setCurrentFilter(filter);getProviderContent(selectedProvider,filter)}}
                    >
                      {getLabel(filter)}
                    </Dropdown.Item>
                  )}
                </Dropdown>

                <Button.Group className="is-hidden-mobile">
                  {filters.map(filter =>
                    <Button
                      key={filter}
                      color={currentFilter === filter ? "primary" : "ghost"}
                      className="has-text-white mr-0"
                      onClick={() => {setCurrentFilter(filter);getProviderContent(selectedProvider,filter)}}
                    >
                      {getLabel(filter)}
                    </Button>
                  )}
                </Button.Group>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column size={12}>
            <Card>
              <Card.Content>
                <Table
                  loading={loading}
                  filteredActivity={currentFilter == "new" ? inProgressActivity : currentFilter=="approved"?approvedActivity:rejectedActivity}
                  getLabel={getLabel}
                  currentFilter={currentFilter}
                />
              </Card.Content>
            </Card>
          </Columns.Column>
          {(currentFilter == "new" ? inProgressActivity : currentFilter=="approved"?approvedActivity:rejectedActivity).length > 0 &&  <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>
                  Showing 1 to {(currentFilter == "new" ? inProgressActivity : currentFilter=="approved"?approvedActivity:rejectedActivity).length} activities
                </div>
                <Button
                  color="primary"
                  onClick={() => nextPage()}
                  className="ml-4 px-7 py-3"
                  disabled={hasReachedEnd[currentFilter]}
                >
                  See more
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>}
        </Columns>
    </>
  )
}