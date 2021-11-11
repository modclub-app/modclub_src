import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllContent } from "../../../utils/api";

export default function ModclubApp() {
  // const [content, setContent] = useState(null);

  // const renderContent = async () => {
  //   const status = { 'new' : null };
  //   const content = await getAllContent(status);
  //   let result = [];
   
  //   for (const item of content) {
  //     console.log('item', item)
  //     result.push(
  //       <div className="card mb-5">
  //         <header className="card-header">
  //           <p className="card-header-title">
  //             {item.appName}
  //             <span>Submitted by {item.sourceId}</span>
  //           </p>
  //           <progress className="progress" value="15" max="100">15%</progress>
  //         </header>
  //         <div className="card-content">
  //           <h3 className="subtitle">{item.title}</h3>
  //           <p>{item.text}</p>

  //           createdAt? {item.createdAt}
  //         </div>
  //         <footer className="card-footer">
  //           <div>
  //             <a className="button is-outlined">
  //               <span className="icon"></span>
  //               <span>Rq Stake: {item.minStake}</span>
  //             </a>
  //             <a className="button is-outlined">
  //               <span className="icon"></span>
  //               <span>Reward: {item.minStake}</span>
  //             </a>
  //           </div>
  //           <div>
  //             <Link to={`/app/tasks/${item.id}`} className="button">See More</Link>
  //             <a href="#" className="button is-danger">Reject</a>
  //             <a href="#" className="button is-primary">Approve</a>
  //           </div>
  //         </footer>
  //       </div>
  //     );
  //   }
  //   setContent(<>{result}</>); 
  // }

  // useEffect(() => {
  //   renderContent();
  // }, []);

  return (
    <>
      <h1>Task Item Here!</h1>
    </>
  )
}