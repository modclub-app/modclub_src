import { useCallback, useEffect, useState } from "react";
import { getEnvironmentSpecificValues } from "../../../utils/api";
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
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";
import { Principal } from "@dfinity/principal";
import { wallet_types } from "../../../utils/types";

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
  const { principal } = useConnect();
  const { rs, wallet, modclub, vesting } = useActors();

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
  const [pendingRewards, setPendingRewards] = useState(0);
  const [level, setLevel] = useState<string>("");
  const [subacc, setSubacc] = useState<wallet_types.Account["subaccount"]>([]);

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

  type ResolvedType<T> = T extends Promise<infer R> ? R : T;

  useEffect(() => {
    let isMounted = true;
    const _action = async () => {
      if (subacc.length && digits) {
        let system_bal = await wallet.icrc1_balance_of({
          owner: Principal.fromText(CanisterId),
          subaccount: [subacc],
        });

        let user_bal = await wallet.icrc1_balance_of({
          owner: Principal.fromText(principal),
          subaccount: [],
        });

        let wallet_digits = convert_to_mod(system_bal, BigInt(digits));
        let userBalance = convert_to_mod(user_bal, BigInt(digits));
        if (isMounted) {
          setTokenHoldings((prevState) => ({
            ...prevState,
            wallet: wallet_digits,
            userBalance: userBalance,
          }));
        }
      }
    };
    _action();

    return () => {
      isMounted = false;
    };
  }, [subacc, digits, principal]);

  useEffect(() => {
    let isMounted = true;
    vesting
      .staked_for({
        owner: Principal.fromText(principal),
        subaccount: [],
      })
      .then((stakeForNum) => {
        const stake = convert_to_mod(stakeForNum, digits);
        if (isMounted) {
          setTokenHoldings((prevState) => ({
            ...prevState,
            stake: stake,
          }));
        }
      })
      .catch((error) => {
        if (isMounted) console.error("Error stakeFor", error);
      });

    vesting
      .locked_for({
        owner: Principal.fromText(principal),
        subaccount: [],
      })
      .then((lockedNum) => {
        modclub
          .canClaimLockedReward([BigInt(Number(lockedNum))])
          .then((claimCheck) => {
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
          })
          .catch(() => {
            return "";
          });

        const locked = convert_to_mod(lockedNum, digits);
        if (isMounted) {
          setPendingRewards(locked);
          setTokenHoldings((prevState) => ({
            ...prevState,
            pendingRewards: pendingRewards,
          }));
        }
      });
    return () => {
      isMounted = false;
    };
  }, [digits, principal]);

  const fetchTokenHoldings = async (principal: string, isMounted: boolean) => {
    try {
      const prom1 = rs
        .queryRSAndLevelByPrincipal(Principal.fromText(principal))
        .then((perf) => {
          if (isMounted) {
            setPerformance(Number(perf.score));
            setLevel(Object.keys(perf.level)[0]);
          }
        });

      const prom2 = wallet
        .icrc1_decimals()
        .then((digit) => {
          if (isMounted) {
            setDigits(digit);
          }
        })
        .catch((error) => {
          if (isMounted)
            console.error("Error fetching performance and digit:", error);
        });

      const prom3 = vesting
        .unlocked_stakes_for({
          owner: Principal.fromText(principal),
          subaccount: [],
        })
        .then((unlocked) => {
          if (isMounted) {
            setTokenHoldings((prevState) => ({
              ...prevState,
              unlocked: unlocked,
            }));
          }
        })
        .catch((error) => {
          if (isMounted) console.error("Error unLockedFor:", error);
        });

      const prom4 = vesting
        .claimed_stakes_for({
          owner: Principal.fromText(principal),
          subaccount: [],
        })
        .then((claimStaked) => {
          if (isMounted) {
            setTokenHoldings((prevState) => ({
              ...prevState,
              claimStakedFor: claimStaked,
            }));
          }
        });

      const prom5 =
        modclub &&
        modclub
          .getProfileById(Principal.fromText(principal))
          .then((profile) => {
            let subacc: any = Object.values(profile.subaccounts);
            if (subacc.length > 0) {
              subacc = subacc.find((item) => item[0] === "ACCOUNT_PAYABLE");
            } else {
              subacc = [];
            }
            if (isMounted) {
              setSubacc(subacc.length > 0 ? subacc[1] : subacc);
            }
          });

      const prom6 = vesting
        .pending_stakes_for({
          owner: Principal.fromText(principal),
          subaccount: [],
        })
        .then((pending) => {
          if (pending != undefined) {
            if (isMounted) {
              setLockBlock(pending);
            }
          }
        })
        .catch((error) => {
          if (isMounted) console.error("Error fetching pending stake:", error);
        });

      Promise.all([prom1, prom2, prom3, prom4, prom5, prom6]).then(() => {
        if (isMounted) {
          setHoldingsUpdated(false);
        }
      });
    } catch (error) {
      if (isMounted) console.error("Failed to fetch token holdings:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    principal && fetchTokenHoldings(principal, isMounted);
    return () => {
      isMounted = false;
    };
  }, [principal, modclub]);

  useEffect(() => {
    let isMounted = true;
    fetchTokenHoldings(principal, isMounted);
    return () => {
      isMounted = false;
    };
  }, [showClaim, showDeposit, showStake, showUnstake, showWithdraw]);

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
          amount={pendingRewards}
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
          pendingRewards={pendingRewards}
          userId={principal}
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
          to={principal}
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
          userId={principal}
          lockBlock={Array.isArray(lockBlock) ? lockBlock : []}
          digit={digits}
        />
      )}
    </>
  );
}
