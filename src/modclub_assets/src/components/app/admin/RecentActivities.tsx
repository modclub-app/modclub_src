import * as React from 'react'
import { Link } from "react-router-dom";
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
  Icon,
  Pagination
} from "react-bulma-components";
import Snippet from "../../common/snippet/Snippet";
import Progress from "../../common/progress/Progress";
import { Activity,ContentPlus } from "../../../utils/types";
import { ContentStatus } from '../../../../../declarations/modclub_staging/modclub_staging.did';

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
                  <td>{("new" in item.status) ? "-" : Number(item.voteCount)}</td>
                  <td>{("new" in item.status) ? "-" : formatDate(item.updatedAt)}</td>
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
  const [completedActivity, setCompletedActivity] = useState<Activity[]>([]);
  const [inProgressActivity, setInProgressActivity] = useState<ContentPlus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");
  const pages = 10;
  const [currentPage,setCurrentPage] = useState<number>(1);
  const filters = ["approved", "new", "rejected"];

  const getLabel = (label: string) => {
    if (label === "new") return "In Progress"
    if (label === "approved") return "Approved"
    if (label === "rejected") return "Rejected"
  }

  const getProviderContent = async (selectedProvider) => {
    let status = {};
    status[currentFilter] = null;
    let providerContents = await fetchProviderContent(selectedProvider.id,status);
    console.log("providerContents",providerContents);

    setLoading(true);
    setInProgressActivity(providerContents);
   /*  if (currentFilter === "new") {
    } else {
      //setCompletedActivity(await getActivity(true));
    } */
    setLoading(false);
  };

  const changeToPage = (page)=>{
    setCurrentPage(page);
  }

  useEffect(() => {
    getProviderContent(selectedProvider);
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
                      onMouseDown={() => setCurrentFilter(filter)}
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
                      onClick={() => setCurrentFilter(filter)}
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
                  filteredActivity={inProgressActivity}
                  getLabel={getLabel}
                  currentFilter={currentFilter}
                />
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
        <Pagination total={pages}
      current={currentPage}
      align="right"
      showPrevNext={false}
      autoHide={false}
      onChange={(page) => changeToPage(page)} className="has-text-white" />
    </>
  )
}