import { useAuth } from "../../utils/auth";
import { getAllContent } from "../../utils/api";
import { useHistory } from "react-router-dom";
import { SignIn } from "../Auth/SignIn";
import Sidebar from "../sidebar/Sidebar";
import Footer from "../footer/Footer";

import { useEffect, useState } from "react";


export default function ModclubApp() {
  const [content, setContent] = useState(null);
  const { isAuthReady, isAuthenticated, user, identity } = useAuth(); 
  const history = useHistory();

  const renderContent = async () => {
    const status = { 'new' : null };
    const content = await getAllContent(status);
    console.log({ content });
    let result = [];
   
    for (const item of content) {
      const str = item.id + " " + item.title + " " + item.text + " ";
      result.push(<li>{str}</li>);
    }
    setContent(<ul>{result}</ul>); 
  }

  useEffect(() => {
    renderContent();
    console.log({ identity, user });
    console.log(identity?.getPrincipal().toString())
    if (!user && isAuthenticated) {
      history.push("/signup");
    }
  }, [identity, user, history]);

  return (
    <>
      <section className="columns">
        <Sidebar />
        <div className="column">
          content here!
        </div>
      </section>
      <Footer />
    </>
  )
  
  // if (isAuthReady && isAuthenticated && user) {
  //   return <h1>Welcome {user}</h1>;
  // } else {
  //   return (<SignIn />)
  // }
}