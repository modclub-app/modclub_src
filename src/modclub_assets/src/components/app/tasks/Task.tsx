import { Principal } from "@dfinity/principal";
// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent, getProvider, getProviderRules } from "../../../utils/api";
import Reject from "../modals/Reject";
import Approve from "../modals/Approve";
import { formatDistanceStrict, format } from "date-fns";










const Sidebar = ({ providerId }: { providerId: Principal }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const renderContent = async () => {
    const content = await getProvider(providerId);
    console.log("content", content);
    setLoading(false);

    setContent(
      <>
        <div className="card">
          <div className="card-content">
            <div className="level">
              <h4 className="subtitle mb-0">{content.name}</h4>
              <a href="#">+ Follow</a>
            </div>

            <table className="table is-striped has-text-left mb-6">
              <tbody>
                <tr>
                  <td>Total Feeds Posted</td>
                  <td>{Number(content.contentCount)}</td>
                </tr>
                <tr>
                  <td>Active Posts</td>
                  <td>{Number(content.activeCount)}</td>
                </tr>
                <tr>
                  <td>Rewards Spent</td>
                  <td>{Number(content.rewardsSpent)}</td>
                </tr>
                <tr>
                  <td>Avg. Stakes</td>
                  <td>100</td>
                </tr>
              </tbody>
            </table>

            <label className="label has-text-white mb-4">Rules</label>
            <ul>
              {content.rules.map((rule) => (
                <li key={rule.id} className="is-flex is-align-items-center">
                  <span className="icon is-small has-text-primary mr-2">
                    <span className="material-icons">trending_flat</span>
                  </span>
                  <span>{rule.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="columns is-multiline mt-3">
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Rq Stake</label>
                  <h3 className="title is-size-1">
                    {Number(content.settings.minVotes)}
                  </h3>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Reward</label>
                  <h3 className="title is-size-1">
                    5
                    <span>MOD<span>token</span></span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Partner Rewards</label>
                  <h3 className="title is-size-1">
                    5
                    <span>MOD<span>token</span></span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
      </>
    )
  }

  useEffect(() => {
    renderContent();
  }, []);

  return (
    <>
        {loading ? (
          <div className="card">
            <div className="card-content">
              <div className="loader-wrapper is-active">
                <div className="loader is-loading"></div>
              </div>
            </div>
          </div>
        ) : content
      }
    </>
  )
};


export default function Task() {
  const [content, setContent] = useState(null);

  const { taskId } = useParams();

  const renderContent = async () => {
    const content = await getContent(taskId);
    // console.log('content', content)

    setContent(
      <div className="columns">
        <div className="column is-two-thirds">
          <div className="card">
            <div className="card-content">
              <header className="card-header">
                <p className="card-header-title">
                  {content.providerName}
                  <span>Submitted by {content.sourceId}</span>
                </p>
                <progress className="progress is-primary" value="80" max="100"></progress>
                <span>{ `${content.voteCount}/${content.minVotes} votes` }</span>
              </header>
              <div className="card-content">
                <h1 className="title">{content.title}</h1>
                <p>{content.text}</p>

                createdAt? {content.createdAt}

                <div className="card has-background-dark my-5">
                  <div className="card-content">
                    <h3 className="subtitle">Additional Information</h3>

                    <div className="level mb-2">
                      <label className="label mb-0 is-flex is-align-items-center">
                        <span className="icon">
                          <span className="material-icons">assignment_ind</span>
                        </span>
                        <span>Link to Post</span>
                      </label>
                      <p className="has-text-silver">http://www.example.com/post1</p>
                    </div>

                    <div className="level mb-2">
                      <label className="label mb-0 is-flex is-align-items-center">
                        <span className="icon">
                          <span className="material-icons">assignment_ind</span>
                        </span>
                        <span>Category</span>
                      </label>
                      <p className="has-text-silver">Gaming</p>
                    </div>

                    <div className="level mb-2">
                      <label className="label mb-0 is-flex is-align-items-center">
                        <span className="icon">
                          <span className="material-icons">assignment_ind</span>
                        </span>
                        <span>Comment</span>
                      </label>
                      <p className="has-text-silver">This post looked suspicious please review as we are not sure.</p>
                    </div>

                  </div>
                </div>

                <div className="level">
                  <Reject platform={content.providerName} id={content.id} providerId={content.providerId} />
                  <Approve platform={content.providerName} id={content.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">

          <Sidebar providerId={content.providerId} /> 

          {/* <div className="columns is-multiline mt-3">
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Rq Stake</label>
                  <h3 className="title is-size-1">
                    1000
                  </h3>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Reward</label>
                  <h3 className="title is-size-1">
                    5
                    <span>MOD<span>token</span></span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="column is-half">
              <div className="card has-gradient">
                <div className="card-content">
                  <label className="label">Partner Rewards</label>
                  <h3 className="title is-size-1">
                    5
                    <span>MOD<span>token</span></span>
                  </h3>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>
    ); 
  }

  useEffect(() => {
    renderContent();
  }, []);

  return (
    <>
      {content}
    </>
  )
}