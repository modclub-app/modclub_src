import { Principal } from "@dfinity/principal";
// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent, getProvider } from "../../../utils/api";
import { Columns, Card, Progress, Level, Heading, Icon } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import Platform from "../platform/Platform";
import ApproveReject from "../modals/ApproveReject";

const InfoItem = ({ icon, title, info }) => {
  return (
    <Level>
      <Heading size={6} className="has-text-silver is-flex is-align-items-center mb-0">
        <Icon className="mr-2">
          <span className="material-icons">{icon}</span>
        </Icon>
        <span>{title}</span>
      </Heading>
      <p className="has-text-silver">
        {info}
      </p>
    </Level>
  );
};

export default function Task() {
  const [content, setContent] = useState(null);

  const { taskId } = useParams();

  const renderContent = async () => {
    const content = await getContent(taskId);
    // console.log('content', content)

    setContent(
      <Columns>
        <Columns.Column>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                {content.providerName}
                <span>
                  Submitted by {content.sourceId}
                </span>
              </Card.Header.Title>
              <Progress value={15} max={100} />
              <span className="progress-label">
                {`${content.voteCount}/${content.minVotes} votes`}
              </span>
            </Card.Header>
            <Card.Content>
              <Heading>
                {content.title}
              </Heading>
              <p>{content.text}</p>

              <Card backgroundColor="dark" className="mt-5">
                <Card.Content>
                  <Heading subtitle>
                    Additional Information
                  </Heading>

                  <InfoItem
                    icon="assignment_ind"
                    title="Link to Post"
                    info="http://www.example.com/post1"
                  />
                  <InfoItem
                    icon="assignment_ind"
                    title="Category"
                    info="Gaming"
                  />
                  <InfoItem
                    icon="assignment_ind"
                    title="Comment"
                    info="This post looked suspicious please review as we are not sure"
                  />
                </Card.Content>
              </Card>

            </Card.Content>
            <Card.Footer className="pt-0" style={{ border: 0 }}>
              <ApproveReject
                platform={content.providerName}
                id={content.id}
                providerId={content.providerId}
                fullWidth={true}
              />
            </Card.Footer>
          </Card>

        </Columns.Column>

        <Columns.Column size={4}>
          <Platform providerId={content.providerId} /> 
        </Columns.Column>
      </Columns>
    ); 
  }

  useEffect(() => {
    renderContent();
  }, []);

  return (
    <>
      <Userstats />
      {content}
    </>
  )
}