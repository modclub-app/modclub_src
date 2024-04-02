import * as React from "react";
import PropTypes from "prop-types";
import { modclub_types } from "../../../../utils/types";
import { formatDate, nanoTimeStrToMilli } from "../../../../utils/util";
import Snippet from "../../../common/snippet/Snippet";
import * as Constant from "../../../../utils/constant";
import InfoLabel from "./InfoLabel";

const renderRow = (item) => (
  <tr key={item.id}>
    <td></td>
    <td>
      {item.sourceId}
      <InfoLabel
        message={item.title[0]}
        style={{
          marginLeft: "10px",
          top: "1rem",
          right: "1rem",
          zIndex: 2,
        }}
      />
    </td>
    <td>{item.contentCategory || "-"}</td>
    <td>{Number(item.voteParameters.requiredVotes) || 0}</td>
    <td>{Number(item.voteCount) || 0}</td>
    <td>{Number(item.votingHistory.approvedCount) || 0}</td>
    <td>{Number(item.votingHistory.rejectedCount) || 0}</td>
    <td>{Number(item.receipt.cost)}</td>
    <td>{"-"}</td>
  </tr>
);

export const Table = ({ loading, filteredActivity, filterLabel }) =>
  loading ? (
    <div className="loader is-loading"></div>
  ) : (
    <div className="table-container">
      <table className="table is-striped">
        <thead>
          <tr>
            <th style={{ width: "5%" }}>#</th>
            <th style={{ width: "25%" }}>ID(provider)</th>
            <th style={{ width: "10%" }}>Category</th>
            <th style={{ width: "10%" }}>RequiredVotes</th>
            <th style={{ width: "10%" }}>Voted</th>
            <th style={{ width: "10%" }}>Approvals</th>
            <th style={{ width: "10%" }}>Rejections</th>
            <th style={{ width: "10%" }}>TaskCost(MOD)</th>
            <th style={{ width: "10%" }}>Dist. Reward</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivity.length ? (
            filteredActivity.map(renderRow)
          ) : (
            <tr className="is-relative">
              <td colSpan={9}>No {filterLabel} Activity</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

Table.propTypes = {
  loading: PropTypes.bool.isRequired,
  filterLabel: PropTypes.string.isRequired,
  filteredActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sourceId: PropTypes.string.isRequired,
      title: PropTypes.array.isRequired,
      contentCategory: PropTypes.string,
      voteParameters: PropTypes.object.isRequired,
      voteCount: PropTypes.number.isRequired,
      votingHistory: PropTypes.object.isRequired,
      receipt: PropTypes.object.isRequired,
    })
  ),
};
