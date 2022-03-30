import * as React from "react";
import { Form, Field } from "react-final-form";
import {
  Notification,
  Columns,
  Card,
  Heading,
  Media,
  Image,
  Button,
  Icon,
} from "react-bulma-components";
import { registerModerator } from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { useHistory } from "react-router-dom";
import { useRef, useState } from "react";
import placeholder from "../../../../assets/user_placeholder.png";
import { ImageData } from "../../../utils/types";
import { validateEmail } from "../../../utils/util";

const MAX_IMAGE_SIZE = 500000; // 500kb

export default function NewProfile() {
  const history = useHistory();
  const { setUser } = useAuth();
  const [pic, setPic] = useState<string>(null);
  const [picType, setPicType] = useState<string>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const inputFile = useRef(null);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const f = files[0];
      if (f.size > 800000) {
        setMessage({ success: false, value: "Maximum file size is 800KB" });
        setTimeout(() => setMessage(null), 2000);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (evt) {
        console.log(evt.target.result);
        const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
        console.log(metadata);
        const data =
          typeof evt.target.result == "string" ? evt.target.result : null;
        setPic(data);
        setPicType(f.type);
      };
      reader.readAsDataURL(f);
    }
  };

  const onFormSubmit = async (values: any) => {
    const { username, email } = values;
    const validEmail = validateEmail(email);
    if (!validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const imageData: ImageData = pic
      ? {
        src: pic,
        type: picType,
      }
      : undefined;

    const regEx = /Reject text: (.*)/g;
    try {
      setSubmitting(true);
      const user = await registerModerator(username, email, imageData);
      console.log("user", user);
      // TODO not returning the error here!
      setUser(user);
      setMessage({ success: true, value: "Sign Up Successfull!" });
      setTimeout(() => {
        setMessage(null);
        history.push("/new-poh-profile");
      }, 2000);
    } catch (e) {
      let errAr = regEx.exec(e.message);
      setMessage({ success: false, value: errAr[1] });
      setSubmitting(false);
    }

    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <>
      {message && (
        <Notification
          color={message.success ? "success" : "danger"}
          className="has-text-centered"
        >
          {message.value}
        </Notification>
      )}

      <Columns centered vCentered className="is-fullheight">
        <Columns.Column size={6}>
          <Card>
            <Card.Content>
              <Heading textAlign="center">Create your profile</Heading>

              <input
                style={{ display: "none" }}
                ref={inputFile}
                onChange={handleFileChange}
                accept="image/*"
                type="file"
              />

              <Media
                justifyContent="center"
                onClick={() => inputFile.current.click()}
              >
                <Image
                  src={pic ? pic : placeholder}
                  alt="profile"
                  size={128}
                  className="is-clickable is-hover-reduced"
                  style={{ overflow: "hidden", borderRadius: "50%" }}
                  rounded
                />
                {!pic && (
                  <div
                    style={{
                      position: "absolute",
                      backgroundColor: "rgba(0, 0, 0, .5)",
                      width: 128,
                      height: 128,
                      borderRadius: "50%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Icon color="white">
                      <span className="material-icons">backup</span>
                    </Icon>
                    <p>Click to add profile photo</p>
                  </div>
                )}
              </Media>

              <Form
                onSubmit={onFormSubmit}
                render={({ handleSubmit, values }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="field">
                      <div className="control has-icons-left">
                        <Field
                          name="username"
                          component="input"
                          type="text"
                          className="input is-medium"
                          placeholder="Username"
                        />
                        <Icon align="left">
                          <span className="material-icons">person</span>
                        </Icon>
                      </div>
                    </div>
                    <div className="field">
                      <div className="control has-icons-left">
                        <Field
                          name="email"
                          component="input"
                          type="text"
                          placeholder="Email"
                          className="input is-medium"
                        />
                        <Icon align="left">
                          <span className="material-icons">email</span>
                        </Icon>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!values.username || !values.email || submitting}
                      size="large"
                      color="primary"
                      fullwidth
                      value="submit"
                      className={submitting ? "is-loading" : ""}
                    >
                      Submit
                    </Button>
                  </form>
                )}
              />
            </Card.Content>
          </Card>
        </Columns.Column>
      </Columns>
    </>
  );
}
