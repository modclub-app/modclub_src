// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent } from "../../../utils/api";
import Reject from "../modals/Reject";
import Approve from "../modals/Approve";
import blueArrowIcon from '../../../../assets/icons/blue_arrow.svg';
import { formatDistanceStrict, format } from "date-fns";


import linkIcon from '../../../../assets/icons/link.svg';
import commentIcon from '../../../../assets/icons/comment.svg';
import categoryIcon from '../../../../assets/icons/category.svg';


export default function Task() {
  const [content, setContent] = useState(null);
  const { taskId } = useParams();

  const renderContent = async () => {
    const content = await getContent(taskId);
    console.log('content', content)

    console.log('content.createdAt', content.createdAt)

    const myNumber = Number(content.createdAt);
    console.log('myNumber', myNumber)

    // const date = formatDistanceStrict(new Date, Number(content.createdAt)) + ' ago';
    // // const date = format(content.createdAt)
    // console.log('date', date)

    setContent(
      <div className="columns">
        <div className="column is-two-thirds">
          <div className="card">
            <div className="card-content">
              <header className="card-header">
                <p className="card-header-title">
                  {content.appName}
                  <span>Submitted by {content.sourceId}</span>
                </p>
                <progress className="progress is-primary" value="80" max="100"></progress>
                <span>10/15 votes</span>
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
                      <span className="icon mr-3">
                        <img src={linkIcon} />
                      </span>
                        <span>Link to Post</span>
                      </label>
                      <p className="has-text-silver">http://www.example.com/post1</p>
                    </div>

                    <div className="level mb-2">
                      <label className="label mb-0 is-flex is-align-items-center">
                      <span className="icon mr-3">
                        <img src={categoryIcon} />
                      </span>
                        <span>Category</span>
                      </label>
                      <p className="has-text-silver">Gaming</p>
                    </div>

                    <div className="level mb-2">
                      <label className="label mb-0 is-flex is-align-items-center">
                      <span className="icon mr-3">
                        <img src={commentIcon} />
                      </span>
                        <span>Comment</span>
                      </label>
                      <p className="has-text-silver">This post looked suspicious please review as we are not sure.</p>
                    </div>

                  </div>
                </div>

                <div className="level">
                  <Reject platform={content.appName} />
                  <Approve platform={content.appName} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card">
            <div className="card-content">
              <div className="level">
                <h4 className="subtitle mb-0">{content.appName}</h4>
                <a href="#">+ Follow</a>
              </div>

              <table className="table is-striped has-text-left mb-6">
                <tbody>
                  <tr>
                    <td>Total Feeds Posted</td>
                    <td>8373</td>
                  </tr>
                  <tr>
                    <td>Active Posts</td>
                    <td>202</td>
                  </tr>
                  <tr>
                    <td>Rewards Spent</td>
                    <td>1100</td>
                  </tr>
                  <tr>
                    <td>Avg. Stakes</td>
                    <td>100</td>
                  </tr>
                </tbody>
              </table>

              <label className="label has-text-white">Rules</label>
              <ul>
                <li>
                  <span className="icon mr-2">
                    <img src={blueArrowIcon} />
                  </span>
                  <span>No sex or drugs</span>
                </li>
                <li>No Racissm</li>
                <li>The post should not contain abusive language to others</li>
                <li>The text must be in english</li>
                <li>No spam</li>
                <li>No Advertsing</li>
              </ul>

            </div>
          </div>

          <div className="columns is-multiline mt-3">
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
          </div>

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