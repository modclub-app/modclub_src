import * as React from 'react'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent, getProviderRules, getTasks } from "../../../utils/api";
import {
  Modal,
  Columns,
  Card,
  Heading,
  Button,
  Icon
} from "react-bulma-components";
import RulesList from "../tasks/RulesList";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import TaskConfirmationModal from "./TaskConfirmationModal";
import { fileToImgSrc, formatDate, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";

const PAGE_SIZE = 20;
const FILTER_VOTES = false;

const Task = ({ task, setVoted }) => {
  const [rules, setRules] = useState([]);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  const fetchRules = async () => {
    const rules = await getProviderRules(task.providerId);
    setRules(rules);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <Columns.Column size={12}>
      <Card>
        <Card.Header>
          <Card.Header.Title>
            {task.providerName}
            <span>Submitted by {task.sourceId} {formatDate(task.createdAt)}</span>
          </Card.Header.Title>
          <Progress
            value={Number(task.voteCount)}
            min={Number(task.minVotes)}
          />
        </Card.Header>
        <Card.Content>
          <Heading subtitle>
            {task.title}
          </Heading>

          {'text' in task.contentType && (
            <p>{task.text}</p>
          )}
          {'imageBlob' in task.contentType && (
            <img src={getImage(task.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
          )}
          {'htmlContent' in task.contentType && (
            <div className="htmlContent content preview">
              <div dangerouslySetInnerHTML={{__html: sanitizeHtml(task.text, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
                })
              }} />
            </div>
          )}

          <Link to={`/app/tasks/${task.id}`} className="button is-block mt-4" style={{ width: 100, margin: "auto" }}>
            See More
          </Link>
        </Card.Content>
        <Card.Footer className="tasks-footer">
          <Button.Group alignItems="flex-end">
            <Button className="is-outlined">
              <Icon align="left" size="small" className="has-text-white">
                <span className="material-icons">local_atm</span>
              </Icon>
              <span>{"Rq Stake: " + task.minStake}</span>
            </Button>
            <Button className="is-outlined">
              <Icon align="left" size="small" className="has-text-white">
                <span className="material-icons">stars</span>
              </Icon>
              <span>{"Reward: " + task.minStake}</span>
            </Button>
          </Button.Group>

          <Button.Group style={{ flexWrap: "wrap" }}>
            <div className="mb-4 mt-1" style={{ width: "100%" }}>
              <RulesList
                platform={task.providerName}
                rules={rules}
              />
            </div>
            <TaskConfirmationModal
              task={task}
              onUpdate={() => setVoted(true)}
            />
          </Button.Group>
        </Card.Footer>
      </Card>
    </Columns.Column>
  );
};

export default function Tasks() {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [voted, setVoted] = useState<boolean>(false);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE
  });
  const [firstLoad, setFirstLoad] = useState(true);


  useEffect(() => {
    if (user && firstLoad && !loading && fetchTasks()) {
      setFirstLoad(false)
    }
  }, [user]);

  useEffect(() => {
    // Fetch everything again if the user votes. This is to ensure that the user's vote is reflected in the UI.
    // TODO: We should use Redux to manage this.
    user && voted && !loading && refetchAll()
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
      endIndex: start + PAGE_SIZE
    });
  }

  const refetchAll = async () => {
    setLoading(true);
    setTasks(await getTasks(0, page.endIndex, FILTER_VOTES));
    setLoading(false);
  }

  const fetchTasks = async () => {
    setLoading(true);
    const newTasks = await getTasks(page.startIndex, page.endIndex, FILTER_VOTES);
    if (newTasks.length < PAGE_SIZE) setHasReachedEnd(true)
    setTasks([...tasks, ...newTasks]);
    setLoading(false);
  }

  if (loading) {
    return (
      <Modal show={true} showClose={false}>
      <div className="loader is-loading p-5"></div>
      </Modal>
    )
  }

  return (
    <>
      <Userstats />

      <Columns>
        {!tasks ? (
          <div className="loader is-loading p-4 mt-6" />
        ) : tasks.map((task) => (

          <Task
            key={task.id}
            task={task}
            setVoted={setVoted}
            />

        ))}
      {tasks != null &&  <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>
                  Showing 1 to {tasks.length} feeds
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
          </Columns.Column>}
      </Columns>
    </>
  )
}