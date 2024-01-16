import * as React from "react";
import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import { Columns, Card, Level, Heading, Icon } from "react-bulma-components";
import { useActors } from "../../../hooks/actors";

const GradientBox = ({ children, title, showToken = true }) => {
  return (
    <Columns.Column
      tablet={{ size: 4 }}
      desktop={{ size: 6 }}
      style={{ padding: ".75rem" }}
    >
      <Card className="has-gradient is-fullheight">
        <Card.Content className="is-fullheight" style={{ padding: "20% 10%" }}>
          <Heading subtitle size={6} className="has-text-silver">
            {title}
          </Heading>
          <Heading
            size={1}
            className="is-flex is-align-items-center"
            style={{ lineHeight: 1, whiteSpace: "nowrap" }}
          >
            {children}
            {showToken && (
              <span className="is-size-5 ml-1">
                MOD
                <span className="is-block has-text-weight-light">token</span>
              </span>
            )}
          </Heading>
        </Card.Content>
      </Card>
    </Columns.Column>
  );
};

export default function Platform({ providerId }: { providerId: Principal }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { modclub } = useActors();
  useEffect(() => {
    const fetchContent = async () => {
      const content = await modclub.getProvider(providerId);
      // USE APP_STATE!
      console.log("provider", content);
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
              {loading ? (
                <div className="loader is-loading"></div>
              ) : (
                content.name
              )}
            </Heading>
          </Level>

          <table className="table is-striped has-text-left mb-6">
            <tbody>
              <tr>
                <td>Total Feeds Posted</td>
                <td>
                  {loading ? (
                    <div className="loader is-loading"></div>
                  ) : (
                    Number(content.contentCount)
                  )}
                </td>
              </tr>
              <tr>
                <td>Active Posts</td>
                <td>
                  {loading ? (
                    <div className="loader is-loading"></div>
                  ) : (
                    Number(content.activeCount)
                  )}
                </td>
              </tr>
              <tr>
                <td>Rewards Spent</td>
                <td>
                  {loading ? (
                    <div className="loader is-loading"></div>
                  ) : (
                    Number(content.rewardsSpent)
                  )}
                </td>
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
            {loading ? (
              <div className="loader is-loading"></div>
            ) : (
              content.rules.map((rule) => (
                <li key={rule.id} className="is-flex mb-1">
                  <Icon size="small" color="primary" className="mr-2 mt-1">
                    <span className="material-icons">trending_flat</span>
                  </Icon>
                  <span>{rule.description}</span>
                </li>
              ))
            )}
          </ul>
        </Card.Content>
      </Card>
    </>
  );
}
