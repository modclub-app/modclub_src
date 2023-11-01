import * as React from "react";
import { modclub_types } from "../../../utils/types";
import { formatDate, nanoTimeStrToMilli } from "../../../utils/util";
import Snippet from "../../common/snippet/Snippet";
import * as Constant from "../../../utils/constant";

const formatReward = (reward) =>
  reward.length === 0 ? "-" : Number(reward).toFixed(2);

const renderRsReceived = (rsReceived) =>
  rsReceived.length === 0 ? "-" : Number(rsReceived) / Constant.RS_FACTOR;

const renderRow = (vote, item: modclub_types.Activity, isPoh: boolean) => (
  <tr key={vote.id}>
    <td>{"approved" in vote.decision ? "Approved" : "Rejected"}</td>
    <td>
      {"new" in item.status
        ? "-"
        : "approved" in item.status
        ? "Approved"
        : "Rejected"}
    </td>
    <td>{item.providerName}</td>
    <td>
      <Snippet string={item.title[0]} truncate={15} />
    </td>
    <td>
      {isPoh
        ? formatDate(nanoTimeStrToMilli(vote.createdAt))
        : formatDate(vote.createdAt)}
    </td>
    <td>{formatReward(vote.totalReward)}</td>
    <td>{formatReward(vote.lockedReward)}</td>
    <td>{renderRsReceived(vote.rsReceived)}</td>
  </tr>
);

export const Table = ({
  loading,
  filteredActivity,
  getLabel,
  currentFilter,
}: {
  loading: Boolean;
  filteredActivity: modclub_types.Activity[];
  getLabel: (activity: string) => string;
  currentFilter: string;
}) => {
  if (loading) {
    return <div className="loader is-loading"></div>;
  } else {
    return (
      <div className="table-container">
        <table className="table is-striped">
          <thead>
            <tr>
              <th>Your Vote</th>
              <th>Final Vote</th>
              <th>App</th>
              <th>Title</th>
              <th>Voted on</th>
              <th>Total Reward</th>
              <th>Locked Reward</th>
              <th>Reputation Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivity.length ? (
              filteredActivity.map((item) => {
                const vote =
                  item.vote.length > 0 ? item.vote[0] : item.pohVote[0];
                const isPoh = item.pohVote.length > 0;
                return renderRow(vote, item, isPoh);
              })
            ) : (
              <tr className="is-relative">
                <td colSpan={8}>No {getLabel(currentFilter)} Activity</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
};
