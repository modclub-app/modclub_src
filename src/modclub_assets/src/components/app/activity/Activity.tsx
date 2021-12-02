// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import { Columns, Card, Heading, Button, Progress } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import Snippet from "../../common/snippet/Snippet";

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
                  <Snippet string={item.title[0]} truncate={20} />
                </td>
                <td className="is-relative">
                  <Progress value={15} max={100} className="mb-0" />
                  <span className="progress-label">
                    {`${item.voteCount}/${item.minVotes} votes`}
                  </span>
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
  const [activity, setActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [filters, setFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState<string>(null);

  const filters = ["completed", "new"];

  const getLabel = (label) => {
    if (label === "new") return "In Progress"
    if (label === "completed") return "Completed"
  }

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await getActivity(false);
      setActivity(activity);
      const filters = [...new Set(activity.map(item => 
        Object.keys(item.status)[0])
      )];

      setCurrentFilter(filters[0])
      setFilteredActivity(activity.filter(item => filters[0] in item.status));
      // setFilters(filters);
      setLoading(false);
    };
    user && fetchActivity();
  }, [user]);

  useEffect(() => {
    if (!activity) return
    setFilteredActivity(activity.filter(item => currentFilter in item.status));
  }, [currentFilter]);

  return (
    <>
      <Userstats detailed={true} />

      {activity.length ?
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
                  filteredActivity={filteredActivity}
                  getLabel={getLabel}
                  currentFilter={currentFilter}
                />
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
        :
        <Card>
          <Card.Content>
            <Heading>
              No Activity Yet
            </Heading>
          </Card.Content>
        </Card>
      }
    </>
  )
}