import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent } from "../../../utils/api";
import { Columns, Card, Heading, Button, Icon } from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import ApproveReject from "../modals/ApproveReject";
import { fileToImgSrc, formatDate, imageToUint8Array, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";

export default function Tasks() {
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  const renderContent = async () => {
    const status = { 'new': null };
    
    const content = await getAllContent(status);
    console.log('content', content)
    let result = [];
   
    for (const item of content) {
      result.push(
        <Columns.Column key={item.id} size={12}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                {item.providerName}
                <span>Submitted by {item.sourceId} {formatDate(item.createdAt)}</span>
              </Card.Header.Title>
              <Progress
                value={Number(item.voteCount)}
                min={Number(item.minVotes)}
              />
            </Card.Header>
            <Card.Content>
              <Heading subtitle>
                {item.title}
              </Heading>
              {'imageBlob' in item.contentType ?
                <img src={getImage(item.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
                :
                <p>{item.text}</p>
              }
            </Card.Content>
            <Card.Footer>
              <Button.Group>
                <Button className="is-outlined">
                  <Icon align="left" size="small" className="has-text-white">
                    <span className="material-icons">local_atm</span>
                  </Icon>
                  <span>{"Rq Stake: " + item.minStake}</span>
                </Button>
                <Button className="is-outlined">
                  <Icon align="left" size="small" className="has-text-white">
                    <span className="material-icons">stars</span>
                  </Icon>
                  <span>{"Reward: "+ item.minStake }</span>
                </Button>
              </Button.Group>

              <Button.Group>
                <Link to={`/app/tasks/${item.id}`} className="button">See More</Link>
                <ApproveReject
                  platform={item.providerName}
                  id={item.id}
                  providerId={item.providerId}
                  onUpdate={() => setVoted(true)}
                />
              </Button.Group>
            </Card.Footer>
          </Card>
        </Columns.Column>
      );
    }
    setContent(<>{result}</>); 
  }

  useEffect(() => {
    user && renderContent();
    setVoted(false);
  }, [user, voted]);
  
  return (
    <>
      <Userstats />

      <Columns>
        {content}
      </Columns>
    </>
  )
}