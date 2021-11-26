import { Principal } from "@dfinity/principal";
// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent, getProvider } from "../../../utils/api";
import { Columns, Card, Progress, Level, Heading, Icon } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import ApproveReject from "../modals/ApproveReject"

const GradientBox = ({ children, title, showToken = true }) => {
  return (
    <Card className="has-gradient is-fullheight">
      <Card.Content className="is-fullheight" style={{ padding: "20% 10%" }}>
        <Heading subtitle size={6} className="has-text-silver">
          {title}
        </Heading>
        <Heading size={1} className="is-flex is-align-items-center" style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
          {children}
          {showToken &&
            <span className="is-size-5 ml-1">
              MOD
              <span className="is-block has-text-weight-light">
                token
              </span>
            </span>
          }
        </Heading>
      </Card.Content>
    </Card>
  );
};

const Sidebar = ({ providerId }: { providerId: Principal }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const content = await getProvider(providerId);
      console.log("content", content);
      setContent(content);
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
  <>
    <Card className="mb-5">
      <Card.Content>
        <Level>
          <Heading subtitle className="mb-0">
            {loading ? <div className="loader is-loading"></div> : content.name}
          </Heading>
          <a href="#">+ Follow</a>
        </Level>

        <table className="table is-striped has-text-left mb-6">
          <tbody>
            <tr>
              <td>Total Feeds Posted</td>
              <td>{loading ? <div className="loader is-loading"></div> : Number(content.contentCount)}</td>
            </tr>
            <tr>
              <td>Active Posts</td>
              <td>{loading ? <div className="loader is-loading"></div> : Number(content.activeCount)}</td>
            </tr>
            <tr>
              <td>Rewards Spent</td>
              <td>{loading ? <div className="loader is-loading"></div> : Number(content.rewardsSpent)}</td>
            </tr>
            <tr>
              <td>Avg. Stakes</td>
              <td>100</td>
            </tr>
          </tbody>
        </table>

        <Heading subtitle size={6}>
          Rules
        </Heading>
        <ul>
          {loading ? <div className="loader is-loading"></div> : content.rules.map((rule) => (
            <li key={rule.id} className="is-flex is-align-items-center">
              <Icon size="small" color="primary" className="mr-2">
                <span className="material-icons">trending_flat</span>
              </Icon>
              <span>{rule.description}</span>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>

    <Columns>
      <Columns.Column size={6}>
        <GradientBox title="Rq Stake" showToken={false}>
          {loading ? <div className="loader is-loading"></div> : Number(content.settings.minVotes)}
        </GradientBox>
      </Columns.Column>
      <Columns.Column size={6}>
        <GradientBox title="Reward">
          5
        </GradientBox>
      </Columns.Column>
      {/* <Columns.Column size={6}>
        <GradientBox title="Partner Rewards">
          5
        </GradientBox>
      </Columns.Column> */}
    </Columns>
  </>
  )
};

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
              <ApproveReject platform={content.providerName} id={content.id} providerId={content.providerId} />
            </Card.Footer>
          </Card>

        </Columns.Column>

        <Columns.Column size={4}>
          <Sidebar providerId={content.providerId} /> 
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