import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent } from "../../../utils/api";
import { Columns, Card, Heading, Button, Icon } from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import ApproveReject from "../modals/ApproveReject";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  const fetchTasks = async () => {
    const status = { "new": null };
    const content = await getAllContent(status);
    setTasks(content); 
  }

  useEffect(() => {
    user && fetchTasks();
    setVoted(false);
  }, [user, voted]);
  
  return (
    <>
      <Userstats />

      <Columns>
        {!tasks ? (
          <div className="loader is-loading p-4 mt-6" />
        ) : tasks.map((task) => (
            <Columns.Column key={task.id} size={12}>
            <Card>
              <Card.Header>
                <Card.Header.Title>
                  {task.providerName}
                  <span>Submitted by {task.sourceId} {formatDate(task.createdAt)}</span>
                </Card.Header.Title>
                <Progress
                  value={Number(task.voteCount)}
                  min={Number(task.minVotes)}
                />
              </Card.Header>
              <Card.Content>
                <Heading subtitle>
                  {task.title}
                </Heading>
                {'imageBlob' in task.contentType ?
                  <img src={getImage(task.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
                  :
                  <p>{task.text}</p>
                }
              </Card.Content>
              <Card.Footer>
                <Button.Group>
                  <Button className="is-outlined">
                    <Icon align="left" size="small" className="has-text-white">
                      <span className="material-icons">local_atm</span>
                    </Icon>
                    <span>{"Rq Stake: " + task.minStake}</span>
                  </Button>
                  <Button className="is-outlined">
                    <Icon align="left" size="small" className="has-text-white">
                      <span className="material-icons">stars</span>
                    </Icon>
                    <span>{"Reward: "+ task.minStake }</span>
                  </Button>
                </Button.Group>

                <Button.Group>
                  <Link to={`/app/tasks/${task.id}`} className="button">See More</Link>
                  <ApproveReject
                    platform={task.providerName}
                    id={task.id}
                    providerId={task.providerId}
                    onUpdate={() => setVoted(true)}
                  />
                </Button.Group>
              </Card.Footer>
            </Card>
          </Columns.Column>
        ))}
      </Columns>
    </>
  )
}