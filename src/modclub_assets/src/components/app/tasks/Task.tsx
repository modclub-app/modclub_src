import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Principal } from "@dfinity/principal";
import {
  Columns,
  Modal,
  Card,
  Level,
  Heading,
  Icon,
  Button,
  Notification,
} from "react-bulma-components";
import Userstats from "../profile/Userstats";
import Platform from "../platform/Platform";
import TaskConfirmationModal from "./TaskConfirmationModal";
import { fileToImgSrc, unwrap, getUrlForData } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import sanitizeHtml from "sanitize-html";
import { useProfile } from "../../../contexts/profile";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import * as Constant from "../../../utils/constant";
import ReserveModal from "../../common/reservemodal/ReserveModal";
import Timer from "../../common/timer/Timer";
import { fetchDataBlob } from "../../../utils/jwt";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";

const InfoItem = ({ icon, title, info }) => {
  return (
    <Level>
      <Heading
        size={6}
        className="has-text-silver is-flex is-align-items-center mb-0"
        style={{ minWidth: 120 }}
      >
        <Icon className="mr-2">
          <span className="material-icons">{icon}</span>
        </Icon>
        <span>{title}</span>
      </Heading>
      <p className="has-text-silver">{info}</p>
    </Level>
  );
};

function resizeIframe(iframe) {
  if (!iframe.contentWindow) {
    console.warn("Cannot access contentWindow property of iframe element");
    return;
  }
  iframe.contentWindow.postMessage("get-iframe-height", "*");
  window.addEventListener("message", (event) => {
    if (
      event.data &&
      event.data.type === "iframe-height" &&
      event.data.src === iframe.src
    ) {
      iframe.style.height = `${event.data.height}px`;
    }
  });
}

export default function Task() {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState(null);
  const [contentRaw, setContentRaw] = useState(null);
  const [contentText, setContentText] = useState("");
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState<boolean>(true);
  const [level, setLevel] = useState<string>("");
  const [reserved, setReserved] = useState(false);
  const initTime = Constant.TIMER;
  const [full, setFull] = useState<boolean | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [time, setTime] = useState(initTime);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(appState.contentReservedTime);
  const { modclub, rs } = useActors();

  const getImage = (data: any) => {
    const image = unwrap<modclub_types.Image>(data);
    return fileToImgSrc(image.data, image.imageType);
  };
  const setTimer = () => {
    const now = new Date().getTime();
    const reservation = (task?.reservedList || [])
      .filter((r) => r.profileId == appState.loginPrincipalId.toString())
      .find((r) => Number(r.reservedExpiryTime) - Number(now) > 0);

    if (reservation) {
      const remind =
        (Number(reservation.reservedExpiryTime) - Number(now)) / 1000.0;
      const isPending = remind > 0;
      setReserved(isPending);
      if (isPending) {
        setCount(Number(remind));
        dispatch({
          type: "setContentReservedTime",
          payload: Number(remind),
        });
      }
    }
  };

  const fetchTask = async () => {
    try {
      const tasks = await modclub.getContent(taskId);
      const task = tasks[0];
      const contentBucketUrl = getUrlForData(
        task.contentCanisterId[0]?.toString(),
        task.id
      );
      const contentBlob = await fetchDataBlob(modclub, contentBucketUrl);
      task && setTask(task);
      contentBlob && setContentRaw(contentBlob);
      contentBlob &&
        contentBlob.type.includes("text") &&
        setContentText(await contentBlob.text());
      setError(!task);
    } catch (error) {
      setError(true);
      console.error(error);
    }
  };

  useEffect(() => {
    appState.userProfile && !task && fetchTask();
  }, [appState.userProfile]);

  useEffect(() => {
    appState.userProfile && voted && fetchTask();
    setVoted(false);
  }, [voted]);

  useEffect(() => {
    task && appState.loginPrincipalId && setTimer();
  }, [task, appState.loginPrincipalId]);

  useEffect(() => {
    const userLevel = Object.keys(appState.rs.level);
    userLevel.length && setLevel(userLevel[0]?.toString());
  }, [appState.rs.level]);

  const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "iframe",
    "video",
    "source",
    "audio",
  ]);

  const iframeAttributes = ["src", "width", "height", "frameborder", "style"];
  const videoAttributes = ["src", "width", "height", "controls", "preload"];
  const audioAttributes = ["controls"];
  const sourceAttributes = ["src", "type"];
  const imgAttributes = [
    "src",
    "srcset",
    "alt",
    "title",
    "width",
    "height",
    "loading",
  ];
  const linkAttributes = ["href", "target", "rel", "style"];
  const allowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: iframeAttributes,
    video: videoAttributes,
    audio: audioAttributes,
    source: sourceAttributes,
    img: imgAttributes,
    a: linkAttributes,
  };

  const transformTags = {
    a: (tagName, attribs) => {
      // Ensure all <a> tags have target="_blank" so link opens in new tab
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      };
    },
  };

  const sanitizedHtml = sanitizeHtml((task && task.text[0]) || "<div></div>", {
    allowedTags,
    allowedAttributes,
    transformTags,
  });

  const toggleReserveModal = () => {
    setShowReserveModal(!showReserveModal);
  };

  const toggleRefresh = () => {
    window.location.reload();
  };

  const triggerGTMEvent = () => {
    // GTM: determine the quantity of people who voted task
    GTMManager.trackEvent(
      GTMEvent.TaskVoteEventName,
      {
        uId: appState.loginPrincipalId,
        userLevel: Object.keys(appState.rs.level)[0],
        eventType: GTMTypes.TaskVoteReserveEventType,
      },
      ["uId"]
    );
  };

  const createReservation = async () => {
    setLoading(true);
    try {
      const res = await modclub.reserveContent(taskId);
      if (res.ok) {
        const newTask = {
          ...task,
          reservedList: [...task?.reservedList, res.ok],
        };
        triggerGTMEvent();

        setTask(newTask);
        setTimer();
        toggleReserveModal();
      } else {
        dispatch({
          type: "appendError",
          payload: `Error occurs for task reservation: ERROR::${res.err || ""}`,
        });
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setFull(true);

      console.log("Reservation Error: ", e.message);

      dispatch({
        type: "appendError",
        payload: e.message,
      });
    }
  };

  useEffect(() => {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      iframe.addEventListener("load", () => {
        resizeIframe(iframe);
      });
      window.addEventListener("message", (event) => {
        if (
          event.data &&
          event.data.type === "iframe-height" &&
          event.data.src === iframe.src
        ) {
          iframe.style.height = `${event.data.height}px`;
        }
      });
    });
  }, [sanitizedHtml]);

  return (
    <>
      <Userstats />
      {error && (
        <Notification color={"danger"} className="has-text-centered">
          {Constant.DATA_REMOVE_MSG}
        </Notification>
      )}
      {!task ? (
        <>{!error && <div className="loader is-loading p-4 mt-6" />}</>
      ) : (
        <Columns>
          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 8 }}>
            <Card>
              <Card.Header>
                <Card.Header.Title>
                  <span>{task.sourceId}</span>
                  <span>Submitted by</span> {task.providerName}
                </Card.Header.Title>
              </Card.Header>
              <Card.Content>
                <Heading>{task.title}</Heading>

                {"text" in task.contentType && <p>{contentText}</p>}
                {"imageBlob" in task.contentType && contentRaw && (
                  <img
                    src={URL.createObjectURL(contentRaw)}
                    alt="Image File"
                    style={{ display: "block", margin: "auto" }}
                  />
                )}
                {"htmlContent" in task.contentType && (
                  <div className="htmlContent content">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: contentText,
                      }}
                    />
                  </div>
                )}
              </Card.Content>

              {reserved && level != "novice" && (
                <>
                  {!task.hasVoted[0] && (
                    <Card.Footer className="pt-0" style={{ border: 0 }}>
                      <Button.Group>
                        <TaskConfirmationModal
                          task={task}
                          level={level}
                          fullWidth={true}
                          onUpdate={() => setVoted(true)}
                        />
                      </Button.Group>
                    </Card.Footer>
                  )}
                </>
              )}
              {level == "novice" && (
                <>
                  {!task.hasVoted[0] && (
                    <Card.Footer className="pt-0" style={{ border: 0 }}>
                      <Button.Group>
                        <TaskConfirmationModal
                          task={task}
                          level={level}
                          fullWidth={true}
                          onUpdate={() => setVoted(true)}
                        />
                      </Button.Group>
                    </Card.Footer>
                  )}
                </>
              )}
            </Card>

            <ReserveModal
              toggleReserveModal={toggleReserveModal}
              content={
                full ? (
                  <>
                    <Heading>Reservations Full</Heading>
                    <Heading subtitle>
                      There are no more slots available for this task.
                    </Heading>
                  </>
                ) : (
                  <>
                    <Heading>Task Reserved</Heading>
                    <Heading subtitle>
                      You have reserved the task. You can now cast your vote:
                    </Heading>
                    <Heading subtitle className="is-flex">
                      <span className="my-auto">
                        Reservation expires: &nbsp;
                      </span>
                      <span className="has-background-grey p-1 box is-rounded my-auto">
                        {time}
                      </span>
                    </Heading>
                  </>
                )
              }
              showReserveModal={showReserveModal}
              createReservation={createReservation}
              reserved={reserved}
              loading={loading}
            />

            {reserved && !task.hasVoted[0] && count > 0 && (
              <Card className="mt-5">
                <Card.Content className="is-flex is-justify-content-center">
                  <>
                    <Heading subtitle className="is-flex">
                      <span className="my-auto">
                        Reservation expires: &nbsp;
                      </span>
                      <span className="has-background-grey p-1 box is-rounded my-auto">
                        <Timer countdown={count} toggle={toggleRefresh} />
                      </span>
                    </Heading>
                  </>
                </Card.Content>
              </Card>
            )}

            {level != "novice" && !reserved && !task.hasVoted[0] && (
              <Card className="mt-5">
                <Card.Content className="is-flex is-justify-content-center">
                  <>
                    {full ? (
                      <Heading subtitle className="is-flex">
                        <span className="my-auto">Reservation full</span>
                      </Heading>
                    ) : (
                      <Button
                        color="primary"
                        fullwidth={true}
                        onClick={toggleReserveModal}
                        disabled={!!reserved || !!full || !!task.hasVoted[0]}
                      >
                        Reserve
                      </Button>
                    )}
                  </>
                </Card.Content>
              </Card>
            )}

            {task.hasVoted[0] && (
              <Card className="mt-5">
                <Card.Content className="is-flex is-justify-content-center">
                  <>
                    <Heading subtitle className="is-flex">
                      <span className="my-auto">Task voted</span>
                    </Heading>
                  </>
                </Card.Content>
              </Card>
            )}
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 4 }}>
            <Platform providerId={task.providerId} />
          </Columns.Column>
        </Columns>
      )}
    </>
  );
}
