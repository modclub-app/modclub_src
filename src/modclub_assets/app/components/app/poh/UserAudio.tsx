import * as React from "react";
import { useEffect, useState } from "react";
import { Card, Columns, Button } from "react-bulma-components";
import { getUrlForData } from "../../../utils/util";
import { PohTaskData } from "../../../utils/types";
import { fetchObjectUrl } from "../../../utils/jwt";
import { useActors } from "../../../utils";

export default function UserAudio({ data }: { data: PohTaskData }) {
  const audioUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const phrases = data.wordList[0];
  const [audioObject, setAudioObject] = useState(null);
  const { modclub } = useActors();

  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(modclub, audioUrl);
      setAudioObject(urlObject);
    };
    fetchData();
  }, []);

  return (
    <Card.Content>
      {audioObject ? (
        <audio
          id="audio"
          controls
          src={audioObject}
          style={{
            display: "block",
            margin: "1rem auto 3rem",
            width: "85%",
          }}
        ></audio>
      ) : (
        <figure className="image is-3by1">
          <div
            className="loader is-loading p-6"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </figure>
      )}

      <Card className="mt-5">
        <Card.Content className="columns is-multiline">
          {phrases.map((phrase, index) => (
            <Columns.Column key={phrase} size={4}>
              <Button fullwidth isStatic>
                {index + 1} <span className="ml-2">{phrase}</span>
              </Button>
            </Columns.Column>
          ))}
        </Card.Content>
      </Card>
    </Card.Content>
  );
}
