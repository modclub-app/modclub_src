import { useCallback, useEffect, useState } from "react";
import {
  canClaimLockedReward,
  claimStakeFor,
  getEnvironmentSpecificValues,
  getProfileById,
  icrc1Balance,
  icrc1Decimal,
  lockedFor,
  pendingStake,
  queryRSAndLevelByPrincipal,
  stakeFor,
  unLockedFor,
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
import { convert_to_mod } from "../../../utils/util";
import Deposit from "../modals/Deposit";
import { useProfile } from "../../../utils/profile";
import { async } from "q";

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

const { CanisterId } = getEnvironmentSpecificValues(process.env.DEV_ENV);

export default function Userstats({ detailed = false }) {
  const { identity } = useAuth();
  const { user } = useProfile();
  const [holdingsUpdated, setHoldingsUpdated] = useState<boolean>(true);
  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards: 0,
    stake: 0,
    wallet: 0,
    userBalance: 0,
    unLockedFor: 0,
    claimStakedFor: 0,
  });
  const [claimRewards, setClaimRewards] = useState({
    canClaim: false,
    claimAmount: 0,
    claimPrice: 0,
  });

  const [lockBlock, setLockBlock] = useState([]);
  const [performance, setPerformance] = useState<number>(0);
  const [digits, setDigits] = useState<number>(0);
  const [unlockFor, setUnlockFor] = useState<number>(0);
  const [level, setLevel] = useState<string>("");
  const [subacc, setSubacc] = useState<any>([]);

  const [showClaim, setShowClaim] = useState(false);
  const toggleClaim = () => setShowClaim(!showClaim);

  const [showDeposit, setShowWDeposit] = useState(false);
  const toggleDeposit = () => setShowWDeposit(!showDeposit);

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
        let perf,
          digit,
          stake,
          locked,
          bal,
          userBal,
          unlocked,
          pending,
          claimStaked;

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
          [stake, locked, unlocked, claimStaked] = await Promise.all([
            stakeFor(principalId)
              .then((stake) => convert_to_mod(stake, digit))
              .catch((error) => console.error("Error fetching stake:", error)),
            lockedFor(principalId)
              .then((locked) => {
                fetchCanClaim(Number(locked));
                return convert_to_mod(locked, digit);
              })
              .catch((error) => console.error("Error fetching locked:", error)),
            unLockedFor(principalId)
              .then((unlock) => unlock)
              .catch((error) =>
                console.error("Error fetching unlocked:", error)
              ),
            claimStakeFor(principalId)
              .then((claim) => claim)
              .catch((error) =>
                console.error("Error fetching claimStaked:", error)
              ),
          ]);
        } catch (error) {
          console.error("Error fetching stake and locked:", error);
        }

        try {
          let subacc: any = Object.values(
            (await getProfileById(identity.getPrincipal())).subaccounts
          );
          if (subacc.length > 0) {
            subacc = subacc.find((item) => item[0] === "ACCOUNT_PAYABLE");
          } else {
            subacc = [];
          }
          setSubacc(subacc.length > 0 ? subacc[1] : subacc);
          bal = await icrc1Balance(
            CanisterId,
            subacc.length > 0 ? subacc[1] : subacc
          );
          userBal = await icrc1Balance(identity.getPrincipal().toText());
        } catch (error) {
          console.error("USER PROFILE:", error);
        }
        try {
          [pending] = await Promise.all([
            pendingStake(identity.getPrincipal().toText()),
          ]);
        } catch (error) {
          console.error("Error fetching pending stake:", error);
        }
        if (pending[0] != undefined) {
          setLockBlock(pending);
        }
        setTokenHoldings({
          pendingRewards: locked,
          stake: stake,
          wallet: convert_to_mod(bal, BigInt(digit)),
          userBalance: convert_to_mod(userBal, BigInt(digit)),
          unLockedFor: unlocked,
          claimStakedFor: claimStaked,
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
  }, [identity, tokenHoldings]);

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
        {detailed && (
          <StatBox
            loading={holdingsUpdated}
            image={walletImg}
            title="Wallet"
            amount={tokenHoldings.wallet}
            usd={170}
            detailed={detailed}
            message="Wallet"
            isBar={false}
          >
            <Button.Group>
              <Button
                color="dark"
                fullwidth
                onClick={toggleDeposit}
                disabled={holdingsUpdated}
              >
                Deposit
              </Button>
              <Button
                color="dark"
                fullwidth
                onClick={toggleWithdraw}
                disabled={holdingsUpdated}
              >
                Withdraw
              </Button>
            </Button.Group>
          </StatBox>
        )}
        {!detailed && (
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
        )}

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
            <Button
              color="dark"
              fullwidth
              onClick={toggleStake}
              disabled={holdingsUpdated}
            >
              Stake
            </Button>
            <Button
              color="dark"
              fullwidth
              onClick={toggleUnstake}
              disabled={holdingsUpdated}
            >
              Unstake
            </Button>
          </Button.Group>
        </StatBox>
        <StatBox
          loading={holdingsUpdated}
          image={performanceImg}
          title="Pending Rewards"
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
                disabled={
                  level == "novice" || level == "junior" || holdingsUpdated
                }
              >
                Claims
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

      {showDeposit && (
        <Deposit
          toggle={toggleDeposit}
          userTokenBalance={tokenHoldings.userBalance}
          isProvider={false}
          receiver={CanisterId}
          subacc={subacc}
        />
      )}

      {showWithdraw && (
        <Withdraw
          toggle={toggleWithdraw}
          userTokenBalance={tokenHoldings.wallet}
          subacc={subacc}
          to={identity.getPrincipal()}
        />
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
          userId={identity.getPrincipal().toText()}
          lockBlock={lockBlock.length > 0 ? lockBlock : []}
          digit={digits}
        />
      )}
    </>
  );
}
