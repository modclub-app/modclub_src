import { useState } from "react";
import "./Userstats.scss";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';
import performanceImg from '../../../../assets/performance.svg';
import Withdraw from "../modals/Withdraw";
import Stake from "../modals/Stake";
import Unstake from "../modals/Unstake";

export default function Userstats({ detailed = false }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  const [showStake, setShowStake] = useState(false);
  const toggleStake = () => setShowStake(!showStake);

  const [showUnstake, setShowUnstake] = useState(false);
  const toggleUnstake = () => setShowUnstake(!showUnstake);

  return (
    <>
    <div className="stat-boxes columns mb-5">
      <div className="column pb-0">
        <div className="card has-background-circles is-fullheight">
          <div className="card-content">
            <img src={walletImg} />
            <div>
              <p>Wallet</p>
              <h3 className="title is-size-1">
                500
                {detailed && <span className="usd">$17</span>}
              </h3>
            </div>
          </div>
          {detailed &&
            <footer className="card-footer">
              <button className="button is-dark is-fullwidth">Deposit</button>
              <button className="button is-dark is-fullwidth" onClick={toggleWithdraw}>Withdraw</button>
            </footer>
          }
        </div>
      </div>
      <div className="column pb-0">
        <div className="card has-background-circles is-fullheight">
          <div className="card-content">
            <img src={stakedImg} />
            <div>
              <p>Staked</p>
              <h3 className="title is-size-1">
                1000
                {detailed && <span className="usd">$17</span>}
              </h3>
            </div>
          </div>
          {detailed &&
            <footer className="card-footer">
              <button className="button is-dark is-fullwidth" onClick={toggleStake}>Stake</button>
              <button className="button is-dark is-fullwidth" onClick={toggleUnstake}>Unstake</button>
            </footer>
          }
        </div>
      </div>
      <div className="column pb-0">
        <div className="card has-background-circles is-fullheight">
          <div className="card-content">
            <img src={performanceImg} />
            <div>
              <p>Vote performance</p>
              <h3 className="title is-size-1">
                50
                {detailed && <span className="usd">$17</span>}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showWithdraw &&
      <Withdraw toggle={toggleWithdraw} />
    }
    {showStake &&
      <Stake toggle={toggleStake} />
    }
    {showUnstake &&
      <Unstake toggle={toggleUnstake} />
    }
  </>
  )
}