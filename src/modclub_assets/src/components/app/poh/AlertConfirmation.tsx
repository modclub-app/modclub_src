import * as React from 'react'
import { useState } from "react";
import { useParams } from "react-router";
import { registerUserToReceiveAlerts } from "../../../utils/api";
import {
    Notification,
    Button
} from "react-bulma-components";
import { Link } from "react-router-dom";
import { useAuth } from "../../../utils/auth";

export default function AlertConfirmation() {
    let { userID } = useParams();
    const { userAlertVal,setUserAlertVal } = useAuth();
    const [displayNotification, setDisplayNotification] = useState<boolean>(false);
    const [loadSpinner, setLoadSpinner] = useState(false);
    const registerUser = async () => {
        setLoadSpinner(true);
        userID = userID ? userID : location.hash.split('#/app/confirm/poh/alerts/')[1];

        const response = await registerUserToReceiveAlerts(userID, true);
        setLoadSpinner(true);
        setDisplayNotification(response);
        setUserAlertVal(response);
        setTimeout(() => {
            setDisplayNotification(false);
        }, 5000);
    }


    return (
        <div style={{
            marginTop: "25%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
        }}>
            {!userAlertVal && <>
                <h1 className="title is-size-6">Please click on the button below to verify your email id to receive alerts from ModClub!</h1>
                <Button
                    color="primary"
                    size="large"
                    className="button is-large is-primary mt-5"
                    onClick={registerUser}
                >
                    {loadSpinner ? 'Verifying Email Please wait' : 'Click To Verify Email'}
                    {loadSpinner && <div className="loader is-loading" style={{
                        display: "inline-block",
                        left: "8px"
                    }}></div>}
                </Button>
            </>
            }
            {userAlertVal &&
                <>
                    <h1 className="title is-size-6">Your email id is verified successfully!</h1>
                    <Link to="/app" className="button is-large is-primary mt-5">
                        Back to MODCLUB
                    </Link>
                </>
            }
            {displayNotification &&
                <Notification color="success" className="has-text-centered">
                    Your Email Is Successfully Verified!!
                </Notification>
            }
        </div>

    );
};