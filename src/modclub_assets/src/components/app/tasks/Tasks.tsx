import * as React from "react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Columns,
  Card,
  Heading,
  Button,
  Dropdown,
  Icon,
} from "react-bulma-components";
import RulesList from "../tasks/RulesList";
import Userstats from "../profile/Userstats";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import sanitizeHtml from "sanitize-html";
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
  const allowedAttributes = {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: iframeAttributes,
    video: videoAttributes,
    audio: audioAttributes,
    source: sourceAttributes,
    img: imgAttributes,
  };

  const transformTags = {
    a: (tagName, attribs) => {
      // Ensure all <a> tags have target="_blank" so links open in new tab
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

  const sanitizedHtml = sanitizeHtml(task.text[0], {
    allowedTags,
    allowedAttributes,
    transformTags,
  });

  return (
    <Columns.Column size={12}>
      <Card>
        <Card.Header>
          <Card.Header.Title>
            <span> Submitted by </span> {":  " + task.providerName}
            <span> {formatDate(task.createdAt)} </span>
            <span>Category</span> {":  " + task.contentCategory}
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

  const setFilterByProvider = (val) => {
    dispatch({
      type: "setContentProvidersFilter",
      payload: val,
    });
  };
  const setFilterByCategory = (val) => {
    dispatch({
      type: "setContentCategoriesFilter",
      payload: val,
    });
  };

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
        payload: { FILTER_VOTES },
      });
    }
  }, [appState.moderationTasksPage]);

  useEffect(() => {
    setHasReachedEnd(
      appState.contentModerationTasks.length < appState.moderationTasksPageSize
    );
  }, [appState.contentModerationTasks.length]);

  useEffect(() => {
    if (modclub) {
      dispatch({ type: "fetchContentCategories" });
      dispatch({ type: "fetchContentProviders" });
    }
  }, [modclub]);

  const nextPage = () => {
    let nextPageNum = appState.moderationTasksPage + 1;
    let start = (nextPageNum - 1) * appState.moderationTasksPageSize;
    dispatch({
      type: "setModerationTasksPage",
      payload: {
        page: nextPageNum,
        startIndex: start,
      },
    });
  };

  const fetchByFilters = () => {
    dispatch({
      type: "refetchContentModerationTasks",
      payload: { FILTER_VOTES },
    });
  };

  return (
    <>
      <Userstats />
      {appState.moderationTasksLoading ? (
        <div className="loader is-loading p-5"></div>
      ) : (
        <Columns>
          <Columns.Column size={12}>
            <Card>
              <Card.Content>
                <Heading subtitle>Filter Tasks</Heading>
                <Columns>
                  <Columns.Column size={4}>
                    <span>By Provider:</span>
                    <Dropdown
                      className="mr-5"
                      right
                      label={appState.contentProviders.reduce(
                        (l, p) =>
                          p.id == appState.contentProvidersFilter ? p.name : l,
                        ""
                      )}
                      icon={
                        <Icon color="white">
                          <span className="material-icons">expand_more</span>
                        </Icon>
                      }
                    >
                      <Dropdown.Item
                        key={null}
                        value={null}
                        renderAs="a"
                        className={
                          !appState.contentProvidersFilter && "is-active"
                        }
                        onMouseDown={() => setFilterByProvider(null)}
                      >
                        {"none"}
                      </Dropdown.Item>
                      {appState.contentProviders.map((p) => (
                        <Dropdown.Item
                          key={p.id}
                          value={p.id}
                          renderAs="a"
                          className={
                            p.id == appState.contentProvidersFilter &&
                            "is-active"
                          }
                          onMouseDown={() => setFilterByProvider(p.id)}
                        >
                          {p.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </Columns.Column>
                  <Columns.Column size={4}>
                    <span>By Category:</span>
                    <Dropdown
                      className="mr-5"
                      right
                      label={appState.contentCategories.reduce(
                        (l, c) =>
                          c.id == appState.contentCategoriesFilter
                            ? c.title
                            : l,
                        ""
                      )}
                      icon={
                        <Icon color="white">
                          <span className="material-icons">expand_more</span>
                        </Icon>
                      }
                    >
                      <Dropdown.Item
                        key={null}
                        value={null}
                        renderAs="a"
                        className={
                          !appState.contentCategoriesFilter && "is-active"
                        }
                        onMouseDown={() => setFilterByCategory(null)}
                      >
                        {"none"}
                      </Dropdown.Item>
                      {appState.contentCategories.map((c) => (
                        <Dropdown.Item
                          key={c.id}
                          value={c.id}
                          renderAs="a"
                          className={
                            c.id == appState.contentCategoriesFilter &&
                            "is-active"
                          }
                          onMouseDown={() => setFilterByCategory(c.id)}
                        >
                          {c.title}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </Columns.Column>
                  <Columns.Column size={2}>
                    <Button
                      color="primary"
                      style={{ marginTop: "20px" }}
                      onClick={fetchByFilters}
                      className="ml-4 px-7 py-3"
                    >
                      Fetch
                    </Button>
                  </Columns.Column>
                </Columns>
              </Card.Content>
            </Card>
          </Columns.Column>
          {appState.contentModerationTasks.length > 0 &&
            appState.contentModerationTasks.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          {appState.contentModerationTasks.length > 0 && (
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
