import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent } from "../../../utils/api";
import { Columns, Card, Level, Heading, Icon } from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
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
  const [voted, setVoted] = useState<boolean>(true);

  const { taskId } = useParams();

  const renderContent = async () => {
    const content = await getContent(taskId);

    setContent(
      <Columns>
        <Columns.Column tablet={{ size: 12 }} desktop={{ size: 8 }}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                {content.providerName}
                <span>
                  Submitted by {content.sourceId}
                </span>
              </Card.Header.Title>
              <Progress
                value={Number(content.voteCount)}
                min={Number(content.minVotes)}
              />
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
                onUpdate={() => setVoted(true)}
              />
            </Card.Footer>
          </Card>

        </Columns.Column>

        <Columns.Column tablet={{ size: 12 }} desktop={{ size: 4 }}>
          <Platform providerId={content.providerId} /> 
        </Columns.Column>
      </Columns>
    ); 
  }

  useEffect(() => {
    renderContent();
    setVoted(false);
  }, [voted]);

  return (
    <>
      <Userstats />
      {content}
    </>
  )
}