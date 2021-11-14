// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Tasks() {
  const [content, setContent] = useState(null);

  useEffect(() => {
  }, []);
  
  return (
    <>
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
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Approved</td>
                <td>DSCVR</td>
                <td>Title of content</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">10/10 votes</button>
                </td>
                <td>10/09/2021</td>
                <td>1 MOD</td>
                <td>10/09/2021</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </>
  )
}