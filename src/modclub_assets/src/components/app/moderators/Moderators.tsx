// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Moderators() {
  const [content, setContent] = useState(null);

  useEffect(() => {
  }, []);
  
  return (
    <>
      <div className="card mb-5">
        <div className="card-content">
          <h1 className="title">Moderators</h1>
        </div>
      </div>
      <div className="card">
        <div className="card-content">
          <h3 className="subtitle">Most active moderators</h3>

          <table className="table is-striped">
            <thead>
              <tr>
                <th>MODID</th>
                <th>Name</th>
                <th>Voted amt</th>
                <th>Reward received</th>
                <th>Platform rewards</th>
                <th>Last voted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>483250</td>
                <td>Joe Smit</td>
                <td>421</td>
                <td>3000 MOD</td>
                <td>3000 DSCVR</td>
                <td>10/09/2021</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">Flag</button>
                </td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Joe Smit</td>
                <td>421</td>
                <td>3000 MOD</td>
                <td>3000 DSCVR</td>
                <td>10/09/2021</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">Flag</button>
                </td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Joe Smit</td>
                <td>421</td>
                <td>3000 MOD</td>
                <td>3000 DSCVR</td>
                <td>10/09/2021</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">Flag</button>
                </td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Joe Smit</td>
                <td>421</td>
                <td>3000 MOD</td>
                <td>3000 DSCVR</td>
                <td>10/09/2021</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">Flag</button>
                </td>
              </tr>
              <tr>
                <td>483250</td>
                <td>Joe Smit</td>
                <td>421</td>
                <td>3000 MOD</td>
                <td>3000 DSCVR</td>
                <td>10/09/2021</td>
                <td>
                  <button className="button is-gradient is-small is-fullwidth">Flag</button>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </>
  )
}