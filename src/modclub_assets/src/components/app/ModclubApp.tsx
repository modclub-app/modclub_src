import { useAuth } from "../../utils/auth";
import { useHistory } from "react-router-dom";
import { SignIn } from "../Auth/SignIn";
import { useEffect } from "react";


export default function ModclubApp() {
  const { isAuthReady, isAuthenticated, user, identity } = useAuth(); 
  const history = useHistory();

  useEffect(() => {
    console.log({ identity, user });
    console.log(identity?.getPrincipal().toString())
    if (!user && isAuthenticated) {
      history.push("/signup");
    }
  }, [identity, user, history]);
  
  if (isAuthReady) {
    if (isAuthenticated && user) {
      return <h1>Welcome {user}</h1>;
    } else {
        return (<SignIn />)
    }
  }
}