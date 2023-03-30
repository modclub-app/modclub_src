import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../../utils/auth";
import { getContent } from "../../../utils/api";
import {
  Columns,
  Card,
  Level,
  Heading,
  Icon,
  Button,
} from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import Platform from "../platform/Platform";
import TaskConfirmationModal from "./TaskConfirmationModal";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";
import sanitizeHtml from "sanitize-html-react";

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

export default function Task() {
  const { user } = useAuth();
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  };

  const fetchTask = async () => {
    const content = await getContent(taskId);
    console.log(content);
    setTask(content);
  };

  useEffect(() => {
    user && !task && fetchTask();
  }, [user]);

  useEffect(() => {
    user && voted && fetchTask();
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

  const sanitizedHtml = sanitizeHtml(task.text, {
    allowedTags,
    allowedAttributes,
  });

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
                <Progress
                  value={Number(task.voteCount)}
                  min={Number(task.minVotes)}
                />
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
                    <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
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
              <Card.Footer className="pt-0" style={{ border: 0 }}>
                <Button.Group>
                  <TaskConfirmationModal
                    task={task}
                    fullWidth={true}
                    onUpdate={() => setVoted(true)}
                  />
                </Button.Group>
              </Card.Footer>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 4 }}>
            <Platform providerId={task.providerId} />
          </Columns.Column>
        </Columns>
      )}
    </>
  );
}
