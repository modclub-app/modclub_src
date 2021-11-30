// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import { Card, Heading, Button, Progress } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import Snippet from "../../common/Snippet";

export default function Activity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [filteredActivity, setFilteredActivity] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState<string>("In Progress");

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await getActivity(false);
      // console.log("activity", activity);
      setActivity(activity);

      const progress = activity.find(item => "new" in item.status)
      if (progress) {
        setFilters([...filters, "In Progress"]);
        setFilteredActivity(activity.filter(item => "new" in item.status));
      }

      const completed = activity.find(item => "completed" in item.status)
      if (completed) {
        setFilters([...filters, "Completed"]);
        setCurrentFilter("Completed")
        setFilteredActivity(activity.filter(item => "completed" in item.status));
      }

      setLoading(false);
    };
    user && fetchActivity();
  }, [user]);

  useEffect(() => {
    if (!activity) return
    const key = currentFilter === "In Progress" ? "new" : "completed"
    setFilteredActivity(activity.filter(item => key in item.status));
  }, [currentFilter]);

  return (
    <>
      <Userstats detailed={true} />

      {activity && activity.length ?
      <>
        <Card className="mb-5">
          <Card.Content className="level">
            <Heading className="mb-0">
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
                  {filter}
                </Button>
              )}
            </Button.Group>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
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
                {loading ?
                  <tr>
                    <td>
                      <div className="loader is-loading"></div>
                    </td>
                  </tr>
                  : filteredActivity && filteredActivity.map((item) => (
                  <tr key={item.vote.id}>
                    <td>
                      {("approved" in item.vote.decision) ? "Approved" : "Rejected" }
                    </td>
                    <td>{item.providerName}</td>
                    <td>
                      <Snippet string={item.title[0]} truncate={20} />
                    </td>
                    <td className="is-relative">
                      <div>
                      <Progress value={15} max={100} className="mb-0" />
                      <span className="progress-label">
                        {`${item.voteCount}/${item.minVotes} votes`}
                      </span>
                      </div>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{Number(item.reward)} MOD</td>
                    <td>{formatDate(item.rewardRelease)}</td>
                  </tr>
                  ))
                }
              </tbody>
            </table>
          </Card.Content>
        </Card>
      </> :
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