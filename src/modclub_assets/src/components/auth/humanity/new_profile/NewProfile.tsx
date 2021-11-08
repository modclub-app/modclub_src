import "./NewProfile.scss";
import { Form, Field } from 'react-final-form';
import { registerModerator } from "../../../../utils/api";




export default function NewProfile() {
  const onFormSubmit = async (values: any) => {
    const { username, email, description } = values;
    if (!username) {
      console.error('Please enter a username');
      return;
    }
   const user = await registerModerator(username);

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
              <input type='button' className="BlueButton" value="Next"/>
            </div>
          </form>
        )} />
      </div>
      </div>
  );
}