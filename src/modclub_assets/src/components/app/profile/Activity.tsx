// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import { Columns, Card, Heading, Button } from "react-bulma-components";
import Userstats from "./Userstats";
import Snippet from "../../common/snippet/Snippet";
import Progress from "../../common/progress/Progress";

const Table = ({ loading, filteredActivity, getLabel, currentFilter }) => {  
  return loading ? (
    <div className="loader is-loading"></div>
  ) : (
    <div className="table-container">
      <table className="table is-striped">
        <thead>
          <tr>
            <th>Vote</th>
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
              <tr key={item.vote.id}>
                <td>
                  {("approved" in item.vote.decision) ? "Approved" : "Rejected" }
                </td>
                <td>{item.providerName}</td>
                <td>
                  <Snippet string={item.title[0]} truncate={15} />
                </td>
                <td>
                  <Progress
                    value={Number(item.voteCount)}
                    min={Number(item.minVotes)}
                  />
                </td>
                <td>{formatDate(item.createdAt)}</td>
                <td>{Number(item.reward)} MOD</td>
                <td>{formatDate(item.rewardRelease)}</td>
              </tr>
            )
          )
        ) : (
          <tr className="is-relative">
            <td colSpan={7}>
              No {getLabel(currentFilter)} Activity
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  )
}

export default function Activity() {
  const { user } = useAuth();
  const [completedActivity, setCompletedActivity] = useState([]);
  const [inProgressActivity, setInProgressActivity] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");

  const filters = ["completed", "new"];

  const getLabel = (label) => {
    if (label === "new") return "In Progress"
    if (label === "completed") return "Completed"
  }

  const fetchActivity = async (filter) => {
    setLoading(true);
    if (filter === "new") {
      setInProgressActivity(await getActivity(false));
    } else {
      setCompletedActivity(await getActivity(true));
    } 
    setLoading(false);
  };

  useEffect(() => {
    user && fetchActivity(currentFilter);
  }, [user]);

  useEffect(() => {
    fetchActivity(currentFilter);
  }, [currentFilter]);

  return (
    <>
      <Userstats detailed={true} />
        <Columns>
        <Columns.Column size={12}>
            <Card>
              <Card.Content className="level">
                <Heading marginless>
                  Recent Activity
                </Heading>
                <Button.Group>
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
                  filteredActivity={currentFilter == "new" ? inProgressActivity : completedActivity}
                  getLabel={getLabel}
                  currentFilter={currentFilter}
                />
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
    </>
  )
}