import * as React from "react";
import { useEffect, useState } from "react";
import {
  Columns,
  Card,
  Heading,
  Button,
  Media,
  Image,
} from "react-bulma-components";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";
import { modclub_types } from "../../../utils/types";
import { useActors } from "../../../hooks/actors";
import { getModeratorLeaderboard } from "../../../utils/api";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import * as Constants from "../../../utils/constant";
import { useHistory } from "react-router-dom";

const PAGE_SIZE = Constants.LB_PAGE_SIZE;

const ModeratorProfile = ({
  pic,
  name,
}: {
  pic: [] | [modclub_types.Image];
  name: string;
}) => {
  const imgData = unwrap(pic);
  const img = imgData
    ? fileToImgSrc(imgData.data, imgData.imageType)
    : placeholder;

  const snippet = (string, truncate) => {
    return string.length > truncate
      ? string.substring(0, truncate - 3) + "..."
      : string;
  };

  return (
    <div className="is-flex is-align-items-center" style={{ minWidth: 150 }}>
      <Media
        style={{
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(to left, #3d52fa, #c91988",
          padding: 2,
          borderRadius: "50%",
          marginBottom: 0,
          width: 36,
          height: 36,
        }}
      >
        <Image
          src={img}
          size={32}
          rounded
          style={{ overflow: "hidden", borderRadius: "50%" }}
        />
      </Media>
      <div className="ml-2 is-flex is-flex-direction-column is-justify-content-center has-text-left">
        <Heading size={6} marginless>
          {snippet(name, 15)}
        </Heading>
      </div>
    </div>
  );
};

const ModeratorItem = ({
  rank,
  item,
}: {
  rank: number;
  item: modclub_types.ModeratorLeaderboard;
}) => {
  const [profile, setProfile] = useState<modclub_types.ProfileStable | null>(
    null
  );
  const { modclub } = useActors();
  useEffect(() => {
    const getProfile = async () => {
      const result = await modclub.getProfileById(item.id);
      setProfile(result);
    };

    if (item.id.toString()) {
      getProfile();
    }
  }, [item.id]);

  return (
    <tr>
      <td style={{ fontWeight: "bold" }}>{rank}</td>
      <td>
        <ModeratorProfile pic={profile?.pic || []} name={item.userName} />
      </td>
      <td>{Number(item.completedVoteCount)}</td>
      <td>{Number(item.rewardsEarned)} MOD</td>
      <td>{(Number(item.performance) * 100).toFixed(0)}%</td>
      <td>
        {item.lastVoted?.[0]
          ? new Date(Number(item.lastVoted[0])).toISOString().slice(0, 10)
          : "-"}
      </td>
    </tr>
  );
};

export default function Leaderboard() {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const content = appState.leaderboardContent;
  const [page, setPage] = useState(1);

  return (
    <>
      {appState?.userProfile && appState?.isAdminUser && (
        <Columns>
          <Columns.Column size={12}>
            <Card>
              <Card.Content>
                <Heading>Leaderboard</Heading>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column size={12}>
            <Card>
              <Card.Content>
                <Heading size={6}>Moderators ranked by Rewards Earned</Heading>

                <div className="table-container">
                  <table className="table is-striped">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Moderator</th>
                        <th>Voted Amt</th>
                        <th>Rewards Earned</th>
                        <th>Vote Performance</th>
                        <th>Last voted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.map((item, index) => (
                        <ModeratorItem
                          key={index}
                          rank={index + 1}
                          item={item}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
              <Card.Footer className="mt-6" alignItems="center">
                <div>
                  Showing 1 to {Math.min(page * PAGE_SIZE, content.length)} of{" "}
                  {content.length} feeds
                </div>
                <Button
                  color="primary"
                  onClick={() => setPage(page + 1)}
                  className="ml-4 px-7 py-3"
                  disabled={page * PAGE_SIZE > content.length}
                >
                  See more
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>
        </Columns>
      )}
    </>
  );
}
