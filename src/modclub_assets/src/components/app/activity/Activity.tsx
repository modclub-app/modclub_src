// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import Userstats from "../userstats/Userstats";

export default function Tasks() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await getActivity();
      console.log("activity", activity);
      setActivity(activity);
      setLoading(false);
    };
    fetchActivity();
  }, []);

  return (
    <>
      <Userstats detailed={true} />
      <div className="card mb-5">
        <div className="card-content level">
          <h1 className="title mb-0">Recent Activity</h1>
          <div>
            <button className="button is-primary">Completed</button>
            <button className="button is-ghost has-text-white ml-3">In Progress</button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-content">
          <table className="table is-striped">
            <thead>
              <tr>
                <th>ID</th>
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
                </tr> : activity.map((item) => (
                <tr key={item.vote.id}>
                  <td>{item.vote.id}</td>
                  {/* <td>1234</td> */}
                  <td>
                    {("approved" in item.vote.decision) ? "Approved" : "Rejected" }
                  </td>
                  <td>{item.providerName}</td>
                  <td>{item.title}</td>
                  <td className="is-relative">
                    <progress className="progress mb-0" value="15" max="100"></progress>
                    <span className="progress-label">{`${item.voteCount}/${item.minVotes} votes`}</span>
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{Number(item.reward)} MOD</td>
                  <td>{formatDate(item.rewardRelease)}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </>
  )
}