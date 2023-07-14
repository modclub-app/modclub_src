import { useCallback, useEffect, useState } from "react";
import { queryRSAndLevelByPrincipal} from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { Columns, Button } from "react-bulma-components";
import walletImg from "../../../../assets/wallet.svg";
import stakedImg from "../../../../assets/staked.svg";
import performanceImg from "../../../../assets/performance.svg";
import Withdraw from "../modals/Withdraw";
import Stake from "../modals/Stake";
import Unstake from "../modals/Unstake";
import Claim from "../modals/Claim";
import { StatBox } from "../../common/statbox/StatBox";
import * as Constant from "../../../utils/constant";


const levelMessages = {
  novice: {
    rs: Constant.NOVICE_LEVEL_UPGRADE_MESSAGE,
    claim: Constant.NOVICE_CLAIM_LIMIT_MESSAGE,
  },
  junior: {
    rs: Constant.JUNIOR_LEVEL_UPGRADE_MESSAGE,
    claim: Constant.JUNIOR_CLAIM_LIMIT_MESSAGE,
  },
  senior1: {
    rs: Constant.SENIOR_MODERATOR_MESSAGE,
    claim: Constant.FULL_CLAIM_MESSAGE,
  },
  senior2: {
    rs: Constant.SENIOR_MODERATOR_MESSAGE,
    claim: Constant.FULL_CLAIM_MESSAGE,
  },
  senior3: {
    rs: Constant.SENIOR_MODERATOR_MESSAGE,
    claim: Constant.FULL_CLAIM_MESSAGE,
  },
};

export default function Userstats({ detailed = false }) {
  const { user, identity} = useAuth();
  const [holdingsUpdated, setHoldingsUpdated] = useState<boolean>(true);
  const [principalID, setPrincipalID] = useState<string>("");
  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards: 0,
    stake: 0,
    wallet: 0,
  });
  const [performance, setPerformance] = useState<number>(0);
  const [level, setLevel] = useState<string>("");

  const [showClaim, setShowClaim] = useState(false);
  const toggleClaim = () => setShowClaim(!showClaim);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  const [showStake, setShowStake] = useState(false);
  const toggleStake = () => setShowStake(!showStake);

  const [showUnstake, setShowUnstake] = useState(false);
  const toggleUnstake = () => setShowUnstake(!showUnstake);

  const getUserData = (identity) => {
    const principalId = identity.getPrincipal().toText();
    setPrincipalID(principalId);
  };

  const fetchTokenHoldings = async (identity) => {
    try {
      let perf = await queryRSAndLevelByPrincipal(identity.getPrincipal().toText());
      //TODO: tokenHolding update: Stake amount, Reward, Wallet
      setPerformance(Number(perf.score));
      setLevel(Object.keys(perf.level)[0]);
      setHoldingsUpdated(false);
    } catch (error) {
      console.error('Failed to fetch token holdings:', error);
    }
  };

  useEffect(() => {
    identity && getUserData(identity);
    fetchTokenHoldings(identity);
  }, [identity]);

  useEffect(() => {
    user && holdingsUpdated;
  }, [user, holdingsUpdated]);

  const getRSMessageByLevel = useCallback((level: string) => {
    return levelMessages[level]?.rs || Constant.DEFAULT_MESSAGE;
  }, []);
  const getClaimMessageByLevel = useCallback((level: string) => {
    return levelMessages[level]?.claim || Constant.DEFAULT_MESSAGE;
  }, []);

  const claimMessage = getClaimMessageByLevel(level);
  const rsMessage = getRSMessageByLevel(level);

  return (
    <>
      <Columns>
        <StatBox
          loading={holdingsUpdated}
          image={performanceImg}
          title="Reputation Score"
          amount={performance}
          usd={12}
          detailed={detailed}
          message={rsMessage}
          isBar={true}
          showLevel={true}
          level={level}
        />

        <StatBox
          loading={holdingsUpdated}
          image={stakedImg}
          title="Staked"
          amount={tokenHoldings.stake}
          usd={170}
          detailed={detailed}
          message="Staked"
          isBar={false}
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
          loading={holdingsUpdated}
          image={walletImg}
          title="Claims"
          amount={tokenHoldings.wallet}
          usd={17}
          detailed={detailed}
          message={claimMessage}
          isBar={false}
        >
          <Button.Group>
            <Button
              color="dark"
              onClick={toggleClaim}
              disabled={level == "novice" || level == "junior"}
            >
              Claim
            </Button>
          </Button.Group>
        </StatBox>
      </Columns>

      {showClaim && (
        <Claim toggle={toggleClaim} tokenHoldings={tokenHoldings} />
      )}

      {showWithdraw && (
        <Withdraw toggle={toggleWithdraw} tokenHoldings={tokenHoldings} />
      )}
      {showStake && (
        <Stake
          toggle={toggleStake}
          tokenHoldings={tokenHoldings}
          onUpdate={() => setHoldingsUpdated(true)}
        />
      )}
      {showUnstake && (
        <Unstake
          toggle={toggleUnstake}
          tokenHoldings={tokenHoldings}
          onUpdate={() => setHoldingsUpdated(true)}
        />
      )}
    </>
  );
}
