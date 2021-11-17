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
        <div className="card mb-6" key={item.id}>
          <header className="card-header">
            <p className="card-header-title">
              {item.providerName}
              <span>Submitted by {item.sourceId}</span>
            </p>
            <progress className="progress" value="15" max="100"></progress>
            <span className="progress-label">{`${item.voteCount}/${item.minVotes} votes`}</span>
          </header>
          <div className="card-content">
            <h3 className="subtitle">{item.title}</h3>
            <p>{item.text}</p>

            createdAt? {(new Date(Number(item.createdAt))).toLocaleString()}
          </div>
          <footer className="card-footer">
                
            <div>
              <a className="button is-outlined">
                <span className="icon is-small has-text-white ml-1 mr-2">
                  <span className="material-icons">local_atm</span>
                </span>
                <span>{"Rq Stake: " + item.minStake}</span>
              </a>
              <a className="button is-outlined">
                <span className="icon is-small has-text-white ml-1 mr-2">
                  <span className="material-icons">stars</span>
                </span>
                <span>{"Reward: "+ item.minStake }</span>
              </a>
            </div>
            <div>
              <Link to={`/app/tasks/${item.id}`} className="button">See More</Link>
              <Reject platform={item.providerName} id={item.id} providerId={item.providerId}/>
              <Approve platform={item.providerName} id={item.id} />
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