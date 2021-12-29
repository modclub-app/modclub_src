// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Columns, Card, Heading, Button, Media, Image } from "react-bulma-components";
import { getModeratorLeaderboard } from "../../../utils/api";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";
import { Image__1 } from "../../../utils/types";

const PAGE_SIZE = 30;

const ModeratorProfile = ({ pic, name }: { pic: [] | [Image__1], name: string }) => {
  const imgData = unwrap(pic);
  const img = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder;

  const snippet = (string, truncate) => {
    return string.length > truncate ? string.substring(0, truncate - 3) + "..." : string;
  }

  return (
    <div className="is-flex">
      <Media style={{
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(to left, #3d52fa, #c91988",
        padding: 2,
        borderRadius: "50%",
        marginBottom: 0,
      }}>
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
  )
}

export default function Leaderboard() {
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getData = async () => {
      const profiles = await getModeratorLeaderboard();
      console.log(profiles);
      setContent([
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
        { id: 483250, userName: "Joe Smit", votedAmount: 421, rewardsEarned: 3000, performance: 77, lastVoted: new Date().getTime() },
      ])
    };

    getData();
  }, []);

  return (
    <Columns>
      <Columns.Column size={12}>
        <Card>
          <Card.Content>
            <Heading>
              Leaderboard
            </Heading>
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={12}>
        <Card>
          <Card.Content>
            <Heading size={6}>
              Moderators ranked by Rewards Earned
            </Heading>

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
                  {content.sort((a, b) => a.votedAmount - b.votedAmount).slice(0, page * PAGE_SIZE).map((item, index) => (
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <ModeratorProfile pic={item.pic || []} name={item.userName} />
                      </td>
                      <td>{item.votedAmount}</td>
                      <td>{item.rewardsEarned} MOD</td>
                      <td>{Number(item.performance * 100 / item.votedAmount).toFixed(1)}%</td>
                      <td>{new Date(item.lastVoted).toISOString().slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
          <Card.Footer className="mt-6">
            <div>Showing 1 to {Math.min(page * PAGE_SIZE, content.length)} of {content.length} feeds</div>
            <Button color="primary" onClick={() => setPage(page + 1)} className="ml-4 px-7 py-3" disabled={page * PAGE_SIZE >= content.length}>
              See more
            </Button>
          </Card.Footer>
        </Card>
      </Columns.Column>
    </Columns>
  )
}