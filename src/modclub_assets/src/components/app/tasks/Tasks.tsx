import * as React from "react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Modal, Columns, Card, Heading, Button } from "react-bulma-components";
import RulesList from "../tasks/RulesList";
import Userstats from "../profile/Userstats";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";
import { useProfile } from "../../../contexts/profile";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";
import { Principal } from "@dfinity/principal";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

const FILTER_VOTES = false;

const Task = ({ task }) => {
  const { modclub } = useActors();
  const [rules, setRules] = useState([]);

  const getImage = (data: any) => {
    const image = unwrap<modclub_types.Image>(data);
    return fileToImgSrc(image.data, image.imageType);
  };

  const fetchRules = async () => {
    const rules = await modclub.getRules(task.providerId);
    setRules(rules);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "iframe",
  ]);

  const iframeAttributes = ["src", "width", "height", "frameborder", "style"];
  const allowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: iframeAttributes,
  };

  const sanitizedHtml = sanitizeHtml(task.text, {
    allowedTags,
    allowedAttributes,
  });

  return (
    <Columns.Column size={12}>
      <Card>
        <Card.Header>
          <Card.Header.Title>
            {task.providerName}
            <span>
              Submitted by {task.sourceId} {formatDate(task.createdAt)}
            </span>
          </Card.Header.Title>
        </Card.Header>
        <Card.Content>
          <Heading subtitle>{task.title}</Heading>

          {"text" in task.contentType && <p>{task.text}</p>}
          {"imageBlob" in task.contentType && (
            <img
              src={getImage(task.image)}
              alt="Image File"
              style={{ display: "block", margin: "auto" }}
            />
          )}
          {"htmlContent" in task.contentType && (
            <div className="htmlContent content preview">
              <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            </div>
          )}

          {/*<Link
            to={`/app/tasks/${task.id}`}
            className="button is-block mt-4"
            style={{ width: 100, margin: "auto" }}
          >
            See More
          </Link>*/}
        </Card.Content>
        <Card.Footer className="tasks-footer">
          <Button.Group alignItems="flex-end"></Button.Group>

          <Button.Group style={{ flexWrap: "wrap" }}>
            <div className="mb-4 mt-1" style={{ width: "100%" }}>
              <RulesList platform={task.providerName} rules={rules} />
            </div>
            <Link to={`/app/tasks/${task.id}`}>
              <Button color="primary" className="ml-4">
                See More
              </Button>
            </Link>
          </Button.Group>
        </Card.Footer>
      </Card>
    </Columns.Column>
  );
};

export default function Tasks() {
  const { principal } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [voted, setVoted] = useState<boolean>(false);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const { modclub, rs } = useActors();

  useEffect(() => {
    if (
      modclub &&
      appState.userProfile &&
      voted &&
      !appState.moderationTasksLoading
    ) {
      dispatch({
        type: "setModerationTasksLoading",
        payload: { status: true },
      });
      dispatch({
        type: "refetchContentModerationTasks",
        payload: FILTER_VOTES,
      });
    }
    setVoted(false);
  }, [voted]);

  useEffect(() => {
    if (
      modclub &&
      appState.userProfile &&
      appState.moderationTasksPageStartIndex > 0
    ) {
      dispatch({
        type: "refetchContentModerationTasks",
        payload: FILTER_VOTES,
      });
    }
  }, [appState.moderationTasksPage]);

  useEffect(() => {
    setHasReachedEnd(
      appState.contentModerationTasks.length < appState.moderationTasksPageSize
    );
  }, [appState.contentModerationTasks]);

  const nextPage = () => {
    let nextPageNum = appState.moderationTasksPage + 1;
    let start = (nextPageNum - 1) * appState.moderationTasksPageSize;
    dispatch({
      type: "setModerationTasksPage",
      payload: {
        page: nextPageNum,
        startIndex: start,
        endIndex: start + appState.moderationTasksPageSize,
      },
    });
  };

  return (
    <>
      <Userstats />
      {appState.moderationTasksLoading ||
      !appState.contentModerationTasks.length ? (
        <div className="loader is-loading p-5"></div>
      ) : (
        <Columns>
          {appState.contentModerationTasks.length &&
            appState.contentModerationTasks.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          {appState.contentModerationTasks.length && (
            <Columns.Column size={12}>
              <Card>
                <Card.Footer alignItems="center">
                  <div>
                    Showing {appState.contentModerationTasks.length ? 1 : 0} to{" "}
                    {appState.contentModerationTasks.length} feeds
                  </div>
                  <Button
                    color="primary"
                    onClick={() => nextPage()}
                    className="ml-4 px-7 py-3"
                    disabled={hasReachedEnd}
                  >
                    See more
                  </Button>
                </Card.Footer>
              </Card>
            </Columns.Column>
          )}
        </Columns>
      )}
    </>
  );
}
