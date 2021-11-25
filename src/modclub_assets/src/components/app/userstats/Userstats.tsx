import { useEffect, useState } from "react";
import { getTokenHoldings } from '../../../utils/api';
import { useAuth } from "../../../utils/auth";
import { Columns, Card, Heading } from "react-bulma-components";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';
import performanceImg from '../../../../assets/performance.svg';
import Withdraw from "../modals/Withdraw";
import Stake from "../modals/Stake";
import Unstake from "../modals/Unstake";

const StatBox = ({ children, image, title, amount, usd, detailed }) => {
  return (
    <Card className="has-background-circles is-fullheight">
      <Card.Content className="is-flex is-align-items-center" style={{ padding: "2.5rem 2rem" }}>
        <img src={image} className="mr-4" />
        <div style={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
          <p className="has-text-light">{title}</p>
          <Heading size={1} style={{ lineHeight: 1 }}>
            {amount}
            {detailed &&
              <span className="has-text-weight-normal is-size-4 ml-4">
                ${usd}
              </span>
            }
          </Heading>
        </div>
      </Card.Content>
      {detailed &&
        <Card.Footer className="p-0" style={{ border: 0, marginBottom: "2.5rem" }} >
          {children}
        </Card.Footer>
      }
    </Card>
  );
};

export default function Userstats({ detailed = false }) {
  const { user } = useAuth();

  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards : 0,
    stake : 0,
    wallet : 0,  
  });

  const [showWithdraw, setShowWithdraw] = useState(false);
  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  const [showStake, setShowStake] = useState(false);
  const toggleStake = () => setShowStake(!showStake);

  const [showUnstake, setShowUnstake] = useState(false);
  const toggleUnstake = () => setShowUnstake(!showUnstake);

  // useEffect(() => {
  //   const fetchTokenHoldings = async () => {
  //     const tokenHoldings = await getTokenHoldings();
  //     setTokenHoldings(tokenHoldings);
  //   };
  //   fetchTokenHoldings();
  // }, []);

  useEffect(() => {
    const fetchTokenHoldings = async () => {
      const tokenHoldings = await getTokenHoldings();
      setTokenHoldings(tokenHoldings);
    };
    user && fetchTokenHoldings();
  }, [user]);

  return (
    <>
    <Columns>
      <Columns.Column>
        <StatBox
          image={walletImg}
          title="Wallet"
          amount={tokenHoldings.wallet}
          usd={17}
          detailed={detailed}
        >
          <button className="button is-dark is-fullwidth">Deposit</button>
          <button className="button is-dark is-fullwidth" onClick={toggleWithdraw}>Withdraw</button>
        </StatBox>
      </Columns.Column>
      <Columns.Column>
        <StatBox
          image={stakedImg}
          title="Staked"
          amount={tokenHoldings.stake}
          usd={170}
          detailed={detailed}
        >
          <button className="button is-dark is-fullwidth" onClick={toggleStake}>Stake</button>
          <button className="button is-dark is-fullwidth" onClick={toggleUnstake}>Unstake</button>
        </StatBox>
      </Columns.Column>
      <Columns.Column>
        <StatBox
          image={performanceImg}
          title="Pending rewards"
          amount={50}
          usd={12}
          detailed={detailed}
        >
        </StatBox>
      </Columns.Column>
      
    </Columns>

    {showWithdraw &&
      <Withdraw
        toggle={toggleWithdraw}
        tokenHoldings={tokenHoldings}
      />
    }
    {showStake &&
      <Stake
        toggle={toggleStake}
        tokenHoldings={tokenHoldings}
      />
    }
    {showUnstake &&
      <Unstake
        toggle={toggleUnstake}
        tokenHoldings={tokenHoldings}
      />
    }
  </>
  )
}