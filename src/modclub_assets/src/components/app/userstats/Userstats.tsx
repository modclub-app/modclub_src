import { useEffect, useState } from "react";
import { getTokenHoldings } from '../../../utils/api';
import { useAuth } from "../../../utils/auth";
import { Columns, Card, Heading, Button } from "react-bulma-components";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';
import performanceImg from '../../../../assets/performance.svg';
import Withdraw from "../modals/Withdraw";
import Stake from "../modals/Stake";
import Unstake from "../modals/Unstake";

const StatBox = ({ children, image, title, amount, usd, detailed }) => {
  return (
    <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
    {/* <Columns.Column > */}
      <Card backgroundColor="circles" className="is-fullheight">
        {/* <Card.Content className="is-flex is-align-items-center" style={{ padding: "2.5rem 2rem" }}> */}
        <Card.Content className="is-flex is-align-items-center">
          <img src={image} className="mr-4" />
          <div style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
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
          // <Card.Footer paddingless style={{ border: 0, marginBottom: "2.5rem" }} >
          <Card.Footer paddingless style={{ border: 0 }}>
            {children}
          </Card.Footer>
        }
      </Card>
    </Columns.Column>
  );
};

export default function Userstats({ detailed = false }) {
  const { user } = useAuth();
  const [ holdingsUpdated, setHoldingsUpdated ] = useState(true);

  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards : 0,
    stake : 0,
    wallet : 0,  
  });

  const [showWithdraw, setShowWithdraw] = useState(false);
  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  const [showStake, setShowStake] = useState(false);
  const toggleStake = () => {
    setShowStake(!showStake);
    console.log("toggleStake tokenHoldings", tokenHoldings);
    setTokenHoldings(tokenHoldings);
  }

  const [showUnstake, setShowUnstake] = useState(false);
  const toggleUnstake = () => setShowUnstake(!showUnstake);

  useEffect(() => {
    console.log({user, holdingsUpdated});
    const fetchTokenHoldings = async () => {
      const tokenHoldings = await getTokenHoldings();
      setTokenHoldings(tokenHoldings);
      setHoldingsUpdated(false);
    };
    user && holdingsUpdated && fetchTokenHoldings();
  }, [user, holdingsUpdated]);

  return (
    <>
    <Columns>
      <StatBox
        image={walletImg}
        title="Wallet"
        amount={tokenHoldings.wallet}
        usd={17}
        detailed={detailed}
      >
        <Button.Group>
          <Button color="dark" fullwidth>
            Deposit
          </Button>
          <Button color="dark" fullwidth onClick={toggleWithdraw}>
            Withdraw
          </Button>
        </Button.Group>
      </StatBox>
      <StatBox
        image={stakedImg}
        title="Staked"
        amount={tokenHoldings.stake}
        usd={170}
        detailed={detailed}
      >
        <Button.Group>
          <Button color="dark" fullwidth onClick={toggleStake}>
            Stake
          </Button>
          <Button color="dark" fullwidth onClick={toggleUnstake}>
            Unstake
          </Button>
        </Button.Group>
      </StatBox>
      <StatBox
        image={performanceImg}
        title="Pending rewards"
        amount={50}
        usd={12}
        detailed={detailed}
      >
      </StatBox>
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
          onUpdate={() =>  setHoldingsUpdated(true) 
        }
      />
    }
    {showUnstake &&
      <Unstake
        toggle={toggleUnstake}
        tokenHoldings={tokenHoldings}
        onUpdate={() => setHoldingsUpdated(true)}
      />
    }
  </>
  )
}