import { useCallback, useEffect, useState } from "react";
import {
  canClaimLockedReward,
  icrc1Decimal,
  lockedFor,
  queryRSAndLevelByPrincipal,
  stakeFor,
} from "../../../utils/api";
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
import { convert_from_mod, convert_to_mod } from "../../../utils/util";

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
  const { user, identity } = useAuth();
  const [holdingsUpdated, setHoldingsUpdated] = useState<boolean>(true);
  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards: 0,
    stake: 0,
    wallet: 0,
  });
  const [claimRewards, setClaimRewards] = useState({
    canClaim: false,
    claimAmount: 0,
    claimPrice: 0,
  });
  const [performance, setPerformance] = useState<number>(0);
  const [digits, setDigits] = useState<number>(0);
  const [level, setLevel] = useState<string>("");

  const [showClaim, setShowClaim] = useState(false);
  const toggleClaim = () => setShowClaim(!showClaim);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  const [showStake, setShowStake] = useState(false);
  const toggleStake = () => setShowStake(!showStake);

  const [showUnstake, setShowUnstake] = useState(false);
  const toggleUnstake = () => setShowUnstake(!showUnstake);

  const fetchTokenHoldings = async (identity) => {
    if (identity != undefined) {
      try {
        const principalId = identity.getPrincipal().toText();
        let perf, digit, stake, locked;

        try {
          [perf, digit] = await Promise.all([
            queryRSAndLevelByPrincipal(principalId),
            icrc1Decimal(),
          ]);
          setDigits(digit);
        } catch (error) {
          console.error("Error fetching performance and digit:", error);
        }
        try {
          [stake, locked] = await Promise.all([
            stakeFor(principalId).then((stake) => convert_to_mod(stake, digit)),
            lockedFor(principalId).then((locked) => {
              fetchCanClaim(Number(locked));
              return convert_to_mod(locked, digit);
            }),
          ]);
        } catch (error) {
          console.error("Error fetching stake and locked:", error);
        }
        setTokenHoldings({
          pendingRewards: locked,
          stake: stake,
          wallet: 0,
        });
        setPerformance(Number(perf.score));
        setLevel(Object.keys(perf.level)[0]);
        setHoldingsUpdated(false);
      } catch (error) {
        console.error("Failed to fetch token holdings:", error);
      }
    }
  };
  const fetchCanClaim = async (value: number) => {
    const claimCheck = await canClaimLockedReward(value)
      .then((res) => {
        return res;
      })
      .catch(() => {
        return "";
      });
    if (Object.keys(claimCheck)[0] === "ok") {
      setClaimRewards({
        canClaim: claimCheck.ok?.canClaim,
        claimAmount: claimCheck.ok?.claimAmount,
        claimPrice: claimCheck.ok?.claimPrice,
      });
    } else {
      setClaimRewards({
        canClaim: false,
        claimAmount: 0,
        claimPrice: 0,
      });
    }
  };

  useEffect(() => {
    identity && fetchTokenHoldings(identity);
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
          amount={tokenHoldings.pendingRewards}
          usd={17}
          detailed={detailed}
          message={claimMessage}
          isBar={false}
        >
          {claimRewards.canClaim ? (
            <Button.Group>
              <Button
                color="dark"
                onClick={toggleClaim}
                disabled={level == "novice" || level == "junior"}
              >
                Claim
              </Button>
            </Button.Group>
          ) : (
            <>
              {claimRewards.claimPrice > 0 &&
                Constant.CLAIM_LIMIT_MSG(
                  convert_to_mod(
                    BigInt(claimRewards.claimPrice),
                    BigInt(digits)
                  )
                )}
            </>
          )}
        </StatBox>
      </Columns>

      {showClaim && (
        <Claim
          toggle={toggleClaim}
          tokenHoldings={tokenHoldings}
          userId={identity.getPrincipal().toText()}
        />
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
