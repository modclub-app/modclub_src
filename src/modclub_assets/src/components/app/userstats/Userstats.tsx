import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';
import performanceImg from '../../../../assets/performance.svg';

export default function Userstats() {
  return (
    <div className="stat-boxes columns mb-5">
        <div className="column pb-0">
        <div className="card is-fullheight">
            <div className="card-content">
            <img src={walletImg} />
            <div>
                <p>Wallet</p>
                <h3 className="title is-size-1">500</h3>
            </div>
            </div>
        </div>
        </div>
        <div className="column pb-0">
        <div className="card is-fullheight">
            <div className="card-content">
            <img src={stakedImg} />
            <div>
                <p>Staked</p>
                <h3 className="title is-size-1">1000</h3>
            </div>
            </div>
        </div>
        </div>
        <div className="column pb-0">
        <div className="card is-fullheight">
        <div className="card-content">
            <img src={performanceImg} />
            <div>
                <p>Vote performance</p>
                <h3 className="title is-size-1">50%</h3>
            </div>
            </div>
        </div>
        </div>
    </div>
  )
}