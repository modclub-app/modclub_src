import "./NewProfile.scss";
import { Form, Field } from 'react-final-form';
import { registerModerator } from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { useHistory } from "react-router-dom";  



export default function NewProfile() {
  const { history } = useHistory();
  const { setUser } = useAuth();
  const onFormSubmit = async (values: any) => {
    const { username, email, description } = values;
    if (!username) {
      console.error('Please enter a username');
      return;
    }
    const user = await registerModerator(username);
    if (user) {
      setUser(user);
      history.push('/app');
    } else {
      console.error('Error creating user');
    }
    
  };

  return (
    <div className="main">
    <div className="ProfileSection">
      <h1>Create your profile</h1>
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit}>
            <div className="inputField">
              <Field
                name="username"
                component="input"
                type="text"
                placeholder="Username"
              />
            </div>
            <div className="inputField">
              <Field
                name="email"
                component="input"
                type="text"
                placeholder="Email"
              />
            </div>
            <div className="inputField">
              <Field
                name="description"
                component="textarea"
                placeholder="Share more about yourself"
              />
            </div>
            <div className="inputField">
              <input type='submit' className="BlueButton" value="Submit"/>
            </div>
          </form>
        )} />
      </div>
      </div>
  );
}