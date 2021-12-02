import { Form, Field } from "react-final-form";
import {
  Notification,
  Columns,
  Card,
  Heading, 
  Media,
  Image as BulmaImage,
  Button,
  Icon,
  Level
} from "react-bulma-components";
import { registerModerator } from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { useHistory } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import placeholder from "../../../../assets/user_placeholder.png";
import { Image, ImageData } from "../../../utils/types";
import { Steps, Step } from "../../common/steps/Steps";


import Webcam from "react-webcam";



const MAX_IMAGE_SIZE = 500000; // 500kb

const Signup = ({  }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit!!!!")

    const { username, fullname, email, bio } = values;

    const validEmail = validateEmail(email)
    if (!validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return
    }

    setSubmitting(true);
    try {
      setTimeout(() => {
        setSubmitting(false);
      }, 2000);
    } catch (e) {
      setMessage({ success: false, value: "Error!" });
      setSubmitting(false);
    }

    setTimeout(() => setMessage(null), 2000);
  };
  return (
    <>
      <Heading textAlign="center">
        Create your profile
      </Heading>

      <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
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
                name="fullname"
                component="input"
                type="text"
                className="input is-medium"
                placeholder="Full Name"
              />
              <Icon align="left">
                <span className="material-icons">badge</span>
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

          <div className="field">
            <div className="control">
              <Field
                name="bio"
                component="textarea"
                placeholder="Tell us about yourself"
                className="textarea is-medium"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!values.username || !values.fullname || !values.email || !values.bio || submitting}
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
    </>
  )
};

const FaceID = ({  }) => {
  const [pic, setPic] = useState<string>(null);
  const [picType, setPicType] = useState<string>(null);
  const inputFile = useRef(null);


  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const f = files[0];
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



  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("imageSrc", imageSrc);
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);


  return (
    <>
      {!imgSrc ? (
        <div className="is-relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <Button
            color="gradient"
            rounded
            style={{
              position: "absolute",
              bottom: "1rem",
              left: 0,
              right: 0,
              margin: "auto",
              width: "4rem",
              height: "4rem"
            }}
            onClick={captureWebcam}
          />
        </div>
      ) : (
        <>
          <BulmaImage
            src={imgSrc}
          />
          <Level justifyContent="right" className="mt-4">
            <Button color="primary">
              Next
            </Button>
          </Level>
        </>
      )}   

      {/* <input
        ref={inputFile}
        onChange={handleFileChange}
        accept="image/*"
        type="file"
      /> */}


    </>
  )
}

export default function NewProfile() {
  const [hasUser, setHasUser] = useState<boolean>(true);
  const [message, setMessage] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  return (
  <>
    <Columns centered vCentered className="is-fullheight">
      <Columns.Column size={6}>
        {/* {!hasUser ? <Signup /> : <Validate />} */}

        <Card>
          <Card.Content>
            <Steps activeStep={currentStepIndex}>
              <Step id={'1'}  details="Create Profile" />
              <Step id={'2'}  details="Face Id" />
              <Step id={'3'}  details="Video" />
              <Step id={'4'}  details="Confirm" />
            </Steps>

            <Card backgroundColor="dark" className="mt-6">
              <Card.Content>
              {currentStepIndex === 1 &&
                  <Signup />
                }

                {currentStepIndex === 2 &&
                  <FaceID />
                }
              </Card.Content>
            </Card>

            

          </Card.Content>
        </Card>

        <Button.Group className="mt-3">
          <Button fullwidth onClick={() => setCurrentStepIndex(currentStepIndex - 1)}>
            Back
          </Button>
          <Button fullwidth color="primary" onClick={() => setCurrentStepIndex(currentStepIndex + 1)}>
            Next
          </Button>
        </Button.Group>

      </Columns.Column>
    </Columns>

    {message &&
      <Notification color={message.success ? "success" : "danger"} className="has-text-centered">
        {message.value}
      </Notification>
    }
  </>
  );
}
