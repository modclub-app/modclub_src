// import React, { ReactDOM } from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllContent } from "../../../utils/api";
import Reject from "../modals/Reject";
import Approve from "../modals/Approve";

export default function Tasks() {
  const [content, setContent] = useState(null);

  const renderContent = async () => {
    const status = { 'new' : null };
    const content = await getAllContent(status);
    console.log('content', content)
    let result = [];
   
    for (const item of content) {
      console.log('item', item)
      result.push(
        <div className="card mb-5" key={item.id}>
          <header className="card-header">
            <p className="card-header-title">
              {item.appName}
              <span>Submitted by {item.sourceId}</span>
            </p>
            <progress className="progress" value="15" max="100"></progress>
            <span>10/15 votes</span>
          </header>
          <div className="card-content">
            <h3 className="subtitle">{item.title}</h3>
            <p>{item.text}</p>

            createdAt? {item.createdAt}
          </div>
          <footer className="card-footer">
            <div>
              <a className="button is-outlined">
                <span className="icon"></span>
                <span>Rq Stake: {item.minStake}</span>
              </a>
              <a className="button is-outlined">
                <span className="icon"></span>
                <span>Reward: {item.minStake}</span>
              </a>
            </div>
            <div>
              <Link to={`/app/tasks/${item.id}`} className="button">See More</Link>
              <Reject platform={item.appName} />
              <Approve platform={item.appName} />
            </div>
          </footer>
        </div>
      );
    }
    setContent(<>{result}</>); 
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