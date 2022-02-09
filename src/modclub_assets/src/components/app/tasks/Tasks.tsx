import * as React from 'react'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent, getProviderRules } from "../../../utils/api";
import {
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

const Task = ({ task, setVoted }) => {
  const [rules, setRules] = useState([]);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  useEffect(() => {
    const fetchRules = async () => {
      const rules = await getProviderRules(task.providerId);
      setRules(rules);
    };
    fetchRules();
  }, []);

  return (
    <Columns.Column key={task.id} size={12}>
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
          {'imageBlob' in task.contentType ?
            <img src={getImage(task.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
            :
            <p>{task.text}</p>
          }
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
  const [tasks, setTasks] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);

  const fetchTasks = async () => {
    const status = { "new": null };
    const content = await getAllContent(status);
    setTasks(content);
  }

  useEffect(() => {
    user && fetchTasks();
    setVoted(false);
  }, [user, voted]);

  if (!isAuthenticated) return (
    <Columns centered vCentered className="mt-6">
    <Columns.Column size={6}>
      <Card>
        <Card.Content className="has-text-centered">
          <p className="my-6">You need to be logged in to view this page</p>
        </Card.Content>
      </Card>
    </Columns.Column>
  </Columns>
  );
  
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
      </Columns>
    </>
  )
}