import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Heading, Icon, Notification } from "react-bulma-components";
import { getUrlForData } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import { useActors } from "../../../utils";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { ReservedPohButton } from "./ReservedPohButton";
import { fetchObjectUrl } from "../../../utils/jwt";
import { Link } from "react-router-dom";
import ReserveModal from "../../common/reservemodal/ReserveModal";
import * as Constant from "../../../utils/constant";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

const ApplicantSnippet = ({
  applicant,
}: {
  applicant: modclub_types.PohTaskPlus;
}) => {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { profileImageUrlSuffix, createdAt, reward } = applicant;
  const regEx = /canisterId=(.*)&contentId=(.*)/g;
  const match = profileImageUrlSuffix.length
    ? regEx.exec(profileImageUrlSuffix[0])
    : null;
  const imageUrl = match ? getUrlForData(match[1], match[2]) : null;
  const [urlObject, setUrlObject] = useState(null);
  const [message, setMessage] = useState(null);
  const [reserved, setReserved] = useState(!!appState.pohReservedContent);
  const { modclub } = useActors();
  const [time, setTime] = useState(Constant.TIMER_SECOND / 60);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log(
        "Applicant: " +
          applicant.packageId +
          "suffixURL: " +
          profileImageUrlSuffix +
          " imageUrl: " +
          imageUrl
      );
      const urlObject = await fetchObjectUrl(modclub, imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
    return () => {
      setUrlObject(null);
    };
  }, [imageUrl]);

  const toggleReserveModal = () => {
    setShowReserveModal(!showReserveModal);
  };

  const onReservedPoh = async () => {
    setReserved(false);
    setLoading(true);
    try {
      const res = await modclub.createPohVoteReservation(applicant.packageId);
      if (res) {
        dispatch({
          type: "setPohReservedContent",
          payload: res.ok,
        });
      }
      setReserved(true);
      setMessage({ success: true, value: "Reserved POH successful" });
      setLoading(false);

      // GTM: determine the quantity of "reserved" human verification tasks;
      GTMManager.trackEvent(
        GTMEvent.HumanVerificationEventName,
        {
          uId: appState.loginPrincipalId,
          userLevel: Object.keys(appState.rs.level)[0],
          eventType: GTMEvent.HumanVerificationReserveEventType,
        },
        ["uId"]
      );
    } catch (error) {
      setReserved(false);
      setMessage({ success: false, value: "Reserved POH unsuccessful" });
    }
    toggleReserveModal();
  };
  useEffect(() => {
    if (!appState.pohReservedContent && applicant.isReserved) {
      dispatch({
        type: "setPohReservedContent",
        payload: applicant.reservation,
      });
    }
    setReserved(applicant.isReserved);
  }, [applicant]);

  return (
    <div>
      {message && (
        <Notification
          color={message.success ? "success" : "danger"}
          textAlign="center"
        >
          {message.value}
        </Notification>
      )}
      <ReservedPohButton
        packageId={applicant.packageId}
        Text={"View"}
        imageUrl={imageUrl}
        urlObject={urlObject}
        createdAt={applicant.createdAt}
        isEnable={reserved}
      />
      {reserved ? (
        <Link
          to={`/app/poh/${applicant.packageId}`}
          className="card is-flex is-flex-direction-column is-justify-content-flex-end"
        >
          <Button.Group
            className="is-flex-wrap-nowrap mt-5"
            style={{ paddingBottom: 10 }}
          >
            <Button
              fullwidth
              className="is-outlined"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <Icon align="left" size="small" className="has-text-white">
                View
              </Icon>
            </Button>
          </Button.Group>
        </Link>
      ) : (
        <Button.Group
          className="is-flex-wrap-nowrap mt-5"
          style={{ paddingBottom: 10 }}
        >
          <Button
            fullwidth
            className="is-outlined"
            style={{ paddingLeft: 0, paddingRight: 0 }}
            onClick={toggleReserveModal}
          >
            <Icon align="left" size="small" className="has-text-white">
              Reserve
            </Icon>
          </Button>
        </Button.Group>
      )}

      <ReserveModal
        toggleReserveModal={toggleReserveModal}
        content={
          <>
            <Heading>POH Application Reserved</Heading>
            <Heading subtitle>
              You have reserved the poh task. You can now cast your vote:
            </Heading>
            <Heading subtitle className="is-flex">
              <span className="my-auto">Reservation expires: &nbsp;</span>
              <span className="has-background-grey p-1 box is-rounded my-auto">
                {time} Minutes
              </span>
            </Heading>
          </>
        }
        showReserveModal={showReserveModal}
        createReservation={onReservedPoh}
        reserved={reserved}
        loading={loading}
        trackEventId={GTMEvent.HumanVerificationReserveEventType}
      />
    </div>
  );
};

export default ApplicantSnippet;
