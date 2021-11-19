// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import Userstats from "../userstats/Userstats";
import Snippet from "../../common/Snippet";

export default function Tasks() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // const snippet = (string) => {
  //   const truncate = 20
  //   return string.length > truncate ? (
  //     <div className="dropdown is-hoverable">
  //         <div className="dropdown-trigger">
  //           {string.substring(0, truncate - 5) + '...'}
  //         </div>
  //         <div className="dropdown-menu" id="dropdown-menu4" role="menu">
  //           <div className="dropdown-content">
  //             <div className="dropdown-item has-text-white">
  //               {string}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //   ) : string
  // }
  
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
                {/* <th>ID</th> */}
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
                  {/* <td>{item.vote.id}</td> */}
                  <td>
                    {("approved" in item.vote.decision) ? "Approved" : "Rejected" }
                  </td>
                  <td>{item.providerName}</td>
                  <td>

                  {/* {snippet(item.title[0])} */}
                  <Snippet string={item.title[0]} truncate={20} />
                    

                  </td>
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