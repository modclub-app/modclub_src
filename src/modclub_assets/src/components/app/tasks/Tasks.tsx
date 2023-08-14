import * as React from "react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import {
  getProviderRules,
  getTasks,
  queryRSAndLevelByPrincipal,
} from "../../../utils/api";
import { Modal, Columns, Card, Heading, Button } from "react-bulma-components";
import RulesList from "../tasks/RulesList";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";
import { useProfile } from "../../../utils/profile";

const PAGE_SIZE = 20;
const FILTER_VOTES = false;

const Task = ({ task, setVoted, level }) => {
  const [rules, setRules] = useState([]);

  const getImage = (data: any) => {
    const image = unwrap<modclub_types.Image>(data);
    return fileToImgSrc(image.data, image.imageType);
  };

  const fetchRules = async () => {
    const rules = await getProviderRules(task.providerId);
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
          {level != "novice" && (
            <Progress
              value={Number(task.voteCount)}
              min={Number(task.voteParameters.requiredVotes)}
            />
          )}
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
  const { identity } = useAuth();
  const { user } = useProfile();
  const [tasks, setTasks] = useState([]);
  const [voted, setVoted] = useState<boolean>(false);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE,
  });
  const [firstLoad, setFirstLoad] = useState(true);
  const [level, setLevel] = useState<string>("");

  const fetchTokenHoldings = useCallback(async (identity) => {
    let perf = await queryRSAndLevelByPrincipal(
      identity.getPrincipal().toText()!
    );
    setLevel(Object.keys(perf.level)[0]);
  }, []);

  useEffect(() => {
    if (user && firstLoad && !loading && fetchTasks()) {
      setFirstLoad(false);
      fetchTokenHoldings(identity);
    }
  }, [user]);

  useEffect(() => {
    // Fetch everything again if the user votes. This is to ensure that the user's vote is reflected in the UI.
    // TODO: We should use Redux to manage this.
    user && voted && !loading && refetchAll();
    setVoted(false);
  }, [voted]);

  useEffect(() => {
    user && !loading && fetchTasks();
  }, [page]);

  const nextPage = () => {
    let nextPageNum = page.page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    setPage({
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE,
    });
  };

  const refetchAll = async () => {
    setLoading(true);
    setTasks(await getTasks(0, page.endIndex, FILTER_VOTES));
    setLoading(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    const newTasks = await getTasks(
      page.startIndex,
      page.endIndex,
      FILTER_VOTES
    );
    if (newTasks.length < PAGE_SIZE) setHasReachedEnd(true);
    setTasks([...tasks, ...newTasks]);
    setLoading(false);
  };

  if (loading) {
    return (
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    );
  }

  return (
    <>
      <Userstats />

      <Columns>
        {!tasks ? (
          <div className="loader is-loading p-4 mt-6" />
        ) : (
          tasks.map((task) => (
            <Task key={task.id} task={task} setVoted={setVoted} level={level} />
          ))
        )}
        {tasks != null && (
          <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>Showing 1 to {tasks.length} feeds</div>
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
    </>
  );
}
