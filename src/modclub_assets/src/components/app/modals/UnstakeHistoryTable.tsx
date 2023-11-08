import moment from "moment";
import { vesting_types } from "../../../declarations_by_env";
import { convert_to_mod, microsecondToSecond } from "../../../utils/util";
import Timer from "../../common/timer/Timer";

export const UnstakeHistoryTable = ({
  pendingStakeList,
  digit,
}: {
  pendingStakeList: vesting_types.LockBlock;
  digit: number;
}) => {
  const getCountdown = (create:bigint, delay:bigint)=>{
    return microsecondToSecond(create+delay);
  }
  const pendingStakeValue = pendingStakeList ? Object.values(pendingStakeList) : [];
  return (
    <div className="table-container">
      <table className="table is-striped">
        <thead>
          <tr>
            <th>Requested On</th>
            <th>Amount</th>
            <th>Time to release</th>
          </tr>
        </thead>
        <tbody>
          {pendingStakeValue.length ? (
            pendingStakeValue.map((item) => (
              <tr key={item.created_at_time}>
                <td>
                  {item.created_at_time
                    ? moment
                        .utc(microsecondToSecond(item.created_at_time))
                        .format("DD/MM/YYYY")
                    : "-"}
                </td>
                <td>{convert_to_mod(BigInt(item.amount), BigInt(digit))} MOD </td>
                <td>
                  <Timer
                    countdown={getCountdown(Number(item.created_at_time), Number(item.dissolveDelay[0])) 
                    }
                    detail={true}
                    toggle={undefined}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr className="is-relative">
              <td colSpan={8}>No Unstake History</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
