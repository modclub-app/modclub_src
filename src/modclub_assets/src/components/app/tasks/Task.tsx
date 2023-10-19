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
} from "react-bulma-components";
import Userstats from "../profile/Userstats";
import Platform from "../platform/Platform";
import TaskConfirmationModal from "./TaskConfirmationModal";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";
import { useProfile } from "../../../contexts/profile";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import * as Constant from "../../../utils/constant";
import ReserveModal from "../../common/reservemodal/ReserveModal";
import Timer from "../../common/timer/Timer";

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
  const { principal } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState(null);
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
  const setTimer = (reservation) => {
    const now = new Date().getTime();
    const remind =
      (Number(reservation.ok ? reservation.ok.reservedExpiryTime : 0) -
        Number(now)) /
      1000.0;
    setReserved(remind > 0 ? true : false);
    setCount(remind > 0 ? Number(remind) : 0);
    dispatch({
      type: "setContentReservedTime",
      payload: remind > 0 ? Number(remind) : 0,
    });
  };

  const fetchTask = async () => {
    const content = await modclub.getContent(taskId);
    const reservation = await modclub.getReservedByContentId(taskId);
    setTask(content[0]);
    setTimer(reservation);
  };

  const fetchData = async () => {
    const [can_reserved, get_level] = await Promise.all([
      await modclub.canReserveContent(taskId.toString()),
      await rs.queryRSAndLevelByPrincipal(Principal.fromText(principal)),
    ]);
    if (Object.keys(can_reserved)[0] == "ok") {
      setFull(!Object.values<boolean>(can_reserved)[0]);
    }
    setLevel(Object.keys(get_level.level)[0].toString());
  };

  useEffect(() => {
    appState.userProfile && !task && fetchTask() && fetchData();
  }, [appState.userProfile]);

  useEffect(() => {
    appState.userProfile && voted && fetchTask();
    setVoted(false);
  }, [voted]);

  const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "iframe",
  ]);

  const iframeAttributes = ["src", "width", "height", "frameborder", "style"];
  const allowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: iframeAttributes,
  };

  const sanitizedHtml = sanitizeHtml((task && task.text) || "<div></div>", {
    allowedTags,
    allowedAttributes,
  });

  const toggleReserveModal = () => {
    setShowReserveModal(!showReserveModal);
  };

  const toggleRefresh = () => {
    window.location.reload();
  };

  const createReservation = async () => {
    setLoading(true);
    try {
      const res = await modclub.reserveContent(taskId);
      setTimer(res);
      toggleReserveModal();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log("Error create Reservation:", e);
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

      {!task ? (
        <div className="loader is-loading p-4 mt-6" />
      ) : (
        <Columns>
          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 8 }}>
            <Card>
              <Card.Header>
                <Card.Header.Title>
                  {task.providerName}
                  <span>Submitted by {task.sourceId}</span>
                </Card.Header.Title>
              </Card.Header>
              <Card.Content>
                <Heading>{task.title}</Heading>

                {"text" in task.contentType && <p>{task.text}</p>}
                {"imageBlob" in task.contentType && (
                  <img
                    src={getImage(task.image)}
                    alt="Image File"
                    style={{ display: "block", margin: "auto" }}
                  />
                )}
                {"htmlContent" in task.contentType && (
                  <div className="htmlContent content">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizedHtml,
                      }}
                    />
                  </div>
                )}

                {/* <Card backgroundColor="dark" className="mt-5">
                  <Card.Content>
                    <Heading subtitle>
                      Additional Information
                    </Heading>

                    <InfoItem
                      icon="assignment_ind"
                      title="Link to Post"
                      info="http://www.example.com/post1"
                    />
                    <InfoItem
                      icon="assignment_ind"
                      title="Category"
                      info="Gaming"
                    />
                    <InfoItem
                      icon="assignment_ind"
                      title="Comment"
                      info="This post looked suspicious please review as we are not sure"
                    />
                  </Card.Content>
                </Card> */}
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
