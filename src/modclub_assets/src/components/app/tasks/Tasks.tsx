import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent } from "../../../utils/api";
import { Card, Progress, Heading, Button, Icon } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import Reject from "../modals/Reject";
import Approve from "../modals/Approve";
import { fileToImgSrc, formatDate, imageToUint8Array, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";

export default function Tasks() {
  const [content, setContent] = useState(null);
  const { user } = useAuth();

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
        <Card key={item.id} className="mb-6">
          <Card.Header>
            <Card.Header.Title>
              {item.providerName}
              <span>Submitted by {item.sourceId} {formatDate(item.createdAt)}</span>
            </Card.Header.Title>
            <Progress value={15} max={100} />
            <span className="progress-label">{`${item.voteCount}/${item.minVotes} votes`}</span>
          </Card.Header>
          <Card.Content>
            <Heading subtitle>
              {item.title}
            </Heading>
            {'imageBlob' in item.contentType ?
              <img src={getImage(item.image)} alt="Image File" style={{ display: 'block', margin: 'auto' }} />
              :
              <p>{item.text}</p>
            }
          </Card.Content>
          <Card.Footer>
            <Button.Group>
              <Button className="is-outlined">
                <Icon align="left" size="small" className="has-text-white ml-1 mr-2">
                  <span className="material-icons">local_atm</span>
                </Icon>
                <span>{"Rq Stake: " + item.minStake}</span>
              </Button>
              <Button className="is-outlined">
                <Icon align="left" size="small" className="has-text-white ml-1 mr-2">
                  <span className="material-icons">stars</span>
                </Icon>
                <span>{"Reward: "+ item.minStake }</span>
              </Button>
            </Button.Group>

            <Button.Group>
              <Link to={`/app/tasks/${item.id}`} className="button">See More</Link>
              <Reject platform={item.providerName} id={item.id} providerId={item.providerId} />
              <Approve platform={item.providerName} id={item.id} providerId={item.providerId} />
            </Button.Group>
          </Card.Footer>
        </Card>
      );
    }
    setContent(<>{result}</>); 
  }

  useEffect(() => {
    user && renderContent();
  }, [user]);
  
  return (
    <>
      <Userstats />
      {content}
    </>
  )
}