import { useEffect, useState } from "react";
import { getTokenHoldings } from '../../../utils/api';
import "./Userstats.scss";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';
import performanceImg from '../../../../assets/performance.svg';
import Withdraw from "../modals/Withdraw";

export default function Userstats({ detailed = false }) {
  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards : 0,
    stake : 0,
    wallet : 0,  
  });

  useEffect(() => {
    const fetchTokenHoldings = async () => {
      const tokenHoldings = await getTokenHoldings();
      setTokenHoldings(tokenHoldings);
    };
    fetchTokenHoldings();
  }, []);

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
                {tokenHoldings.wallet}
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
                {tokenHoldings.stake}
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