import { useCallback, useEffect, useState } from "react";
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
import { wallet_types } from "../../../utils/types";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

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
  const { principal } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { modclub } = useActors();
  const activeBalanceMsg = Constant.ACTIVE_BALANCE_MSG;

  const [holdingsUpdated, setHoldingsUpdated] = useState<boolean>(true);
  const [tokenHoldings, setTokenHoldings] = useState({
    pendingRewards: convert_to_mod(appState.lockedBalance, appState.decimals),
    stake: convert_to_mod(appState.stakeBalance, BigInt(appState.decimals)),
    wallet: convert_to_mod(appState.systemBalance, BigInt(appState.decimals)),
    userBalance: convert_to_mod(
      appState.personalBalance,
      BigInt(appState.decimals)
    ),
    unLockedFor: convert_to_mod(
      appState.unlockStakeBalance,
      BigInt(appState.decimals)
    ),
    claimStakedFor: convert_to_mod(
      appState.claimedStakeBalance,
      BigInt(appState.decimals)
    ),
  });

  const [claimRewards, setClaimRewards] = useState({
    canClaim: false,
    claimAmount: 0,
    claimPrice: 0,
  });

  const [lockBlock, setLockBlock] = useState([]);
  const pendingRewards = convert_to_mod(
    appState.lockedBalance,
    appState.decimals,
    2
  );
  const level = Object.keys(appState.rs.level)[0];
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
    if (appState.userProfile) {
      const ap_sub_acc_rec = appState.userProfile.subaccounts.find(
        (item) => item[0] === "ACCOUNT_PAYABLE"
      );
      ap_sub_acc_rec && setSubacc(ap_sub_acc_rec[1]);
    }
  }, [appState.userProfile]);

  useEffect(() => {
    let isMounted = true;
    modclub &&
      modclub
        .canClaimLockedReward([BigInt(Number(appState.lockedBalance))])
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

    return () => {
      isMounted = false;
    };
  }, [appState.decimals, principal, modclub]);

  useEffect(() => {
    let isMounted = true;
    dispatch({ type: "fetchUserRS" });
    return () => {
      isMounted = false;
    };
  }, [principal, modclub]);

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
            loading={false}
            image={walletImg}
            title="Active Balance"
            amount={convert_to_mod(
              appState.systemBalance,
              BigInt(appState.decimals),
              2
            )}
            usd={170}
            detailed={detailed}
            message={activeBalanceMsg}
            isBar={false}
          >
            <Button.Group>
              <Button
                color="dark"
                fullwidth
                onClick={toggleDeposit}
                disabled={appState.personalBalanceLoading}
                className={appState.personalBalanceLoading && "is-loading"}
              >
                Deposit
              </Button>
              <Button
                color="dark"
                fullwidth
                onClick={toggleWithdraw}
                disabled={appState.systemBalanceLoading}
                className={appState.systemBalanceLoading && "is-loading"}
              >
                Withdraw
              </Button>
            </Button.Group>
          </StatBox>
        )}
        {!detailed && (
          <StatBox
            loading={false}
            image={performanceImg}
            title="Reputation Score"
            amount={Number(appState.rs.score)}
            usd={12}
            detailed={detailed}
            message={rsMessage}
            isBar={true}
            showLevel={true}
            level={level}
          />
        )}
        <StatBox
          loading={false}
          image={stakedImg}
          title="Staked"
          amount={convert_to_mod(
            appState.stakeBalance,
            BigInt(appState.decimals),
            2
          )}
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
              disabled={appState.stakeBalanceLoading}
              className={appState.stakeBalanceLoading && "is-loading"}
            >
              Stake
            </Button>
            <Button
              color="dark"
              fullwidth
              onClick={toggleUnstake}
              disabled={appState.stakeBalanceLoading}
              className={appState.stakeBalanceLoading && "is-loading"}
            >
              Unstake
            </Button>
          </Button.Group>
        </StatBox>
        <StatBox
          loading={false}
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
                    BigInt(appState.decimals),
                    2
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
          isProvider={false}
          subacc={subacc}
        />
      )}

      {showWithdraw && (
        <Withdraw
          toggle={toggleWithdraw}
          userTokenBalance={convert_to_mod(
            appState.systemBalance,
            BigInt(appState.decimals),
            2
          )}
          subacc={subacc}
          to={principal}
        />
      )}
      {showStake && (
        <Stake
          toggle={toggleStake}
          wallet={convert_to_mod(
            appState.systemBalance,
            BigInt(appState.decimals),
            2
          )}
          stake={convert_to_mod(
            appState.stakeBalance,
            BigInt(appState.decimals),
            2
          )}
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
          digit={appState.decimals}
        />
      )}
    </>
  );
}
