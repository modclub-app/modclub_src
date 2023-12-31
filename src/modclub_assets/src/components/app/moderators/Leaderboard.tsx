import * as React from 'react';
import { useEffect, useState } from "react";
import {
  Columns,
  Card,
  Heading,
  Button,
  Media,
  Image,
} from "react-bulma-components";
import { getModeratorLeaderboard, getProfileById } from "../../../utils/api";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";
import { Image__1, ModeratorLeaderboard, Profile } from "../../../utils/types";

const PAGE_SIZE = 30;

const ModeratorProfile = ({
  pic,
  name,
} : {
  pic: [] | [Image__1];
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
    <div className="is-flex is-align-items-center" style={{minWidth: 150}}>
      <Media
        style={{
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(to left, #3d52fa, #c91988",
          padding: 2,
          borderRadius: "50%",
          marginBottom: 0,
          width: 36,
          height: 36
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

const ModeratorItem = ({ rank, item }: { rank: number, item: ModeratorLeaderboard }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const result = await getProfileById(item.id);
      setProfile(result);
    };

    if (item.id.toString()) {
      getProfile()
    }
  }, [item.id]);

  return (
    <tr>
      <td style={{ fontWeight: 'bold' }}>{rank}</td>
      <td>
        <ModeratorProfile
          pic={profile?.pic || []}
          name={item.userName}
        />
      </td>
      <td>{Number(item.completedVoteCount)}</td>
      <td>{Number(item.rewardsEarned)} MOD</td>
      <td>{(Number(item.performance) * 100).toFixed(0)}%</td>
      <td>
        {item.lastVoted?.[0]
          ? new Date(Number(item.lastVoted[0]))
            .toISOString()
            .slice(0, 10)
          : "-"}
      </td>
    </tr>)
}

export default function Leaderboard() {
  const [content, setContent] = useState<ModeratorLeaderboard[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getData = async () => {
      const newProfiles = await getModeratorLeaderboard(PAGE_SIZE, page);
      setContent([...content, ...newProfiles]);
    };

    getData();
  }, [page]);

  return (
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
                  {content
                    .map((item, index) => (
                      <ModeratorItem key={index} rank={index + 1} item={item} />
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
  );
}
