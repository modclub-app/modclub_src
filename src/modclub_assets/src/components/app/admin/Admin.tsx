// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActivity } from "../../../utils/api";
import { formatDate } from "../../../utils/util";
import Userstats from "../userstats/Userstats";
import Snippet from "../../common/Snippet";

import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';

export default function Admin() {

  return (
    <>
      <div className="columns">
        <div className="column is-two-thirds">
          <div className="card is-fullheight">
            <div className="card-content">
              dsfds
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card is-fullheight">
            <div className="card-content">
              <h4 className="subtitle">
                Stats
              </h4>

              <table className="table is-striped has-text-left mb-6">
                <tbody>
                  <tr>
                    <td>Total Feeds Posted</td>
                    <td>8373</td>
                  </tr>
                  <tr>
                    <td>Active Posts</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>Rewards Spent</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>Avg. Stakes</td>
                    <td>100</td>
                  </tr>
                  <tr>
                    <td>Humans Verified</td>
                    <td>3434</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <div className="card is-fullheight has-background-circles">
            <div className="card-content is-fullheight is-flex is-flex-direction-column is-justify-content-center">
              <h3 className="title mb-2">
                Token Reserve
              </h3>
              <p>The tokens used to found moderators.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card is-fullheight">
            <div className="card-content is-flex is-align-items-center pb-0">
              <img src={walletImg} />
              <div className="mt-3 ml-3" style={{ whiteSpace: 'nowrap', lineHeight: .5 }}>
                <p className="is-size-7 has-text-light">min 100000 tokens</p>
                <h3 className="title is-size-1 level">
                  <span>55k</span>
                  <span className="usd is-size-6 has-text-light has-text-weight-normal ml-3">MOD<br />tokens</span>
                </h3>
              </div>
            </div>
            <footer className="card-footer mb-0" style={{ border: 0 }}>
              <button className="button is-dark is-fullwidth">Buy</button>
              <button className="button is-dark is-fullwidth">Deposit</button>
            </footer>
          </div>
        </div>

        <div className="column">
          <div className="card is-fullheight">
            <div className="card-content is-flex is-align-items-center pb-0">
              <img src={stakedImg} />
              <div className="mt-3 ml-3" style={{ whiteSpace: 'nowrap', lineHeight: .5 }}>
                <h3 className="title is-size-1 level">
                  <span>5</span>
                  <span className="usd is-size-6 has-text-light has-text-weight-normal ml-3">DSCVR<br />tokens</span>
                </h3>
              </div>
            </div>
            <footer className="card-footer mb-0" style={{ border: 0 }}>
              <button className="button is-dark is" style={{ width: '50%' }}>Deposit</button>
            </footer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h3 className="title mb-2">
            Trusted identities
          </h3>
          <p>Add the principal IDs for other members of your team so they can manage your Modclub account</p>
        </div>
      </div>
    </>
  )
}