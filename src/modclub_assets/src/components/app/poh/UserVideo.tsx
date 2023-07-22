import * as React from 'react'
import { useEffect, useState } from "react";
import { Card, Columns, Button } from "react-bulma-components";
import { getUrlForData, fetchObjectUrl } from "../../../utils/util";
import { PohTaskData } from '../../../utils/types';

export default function UserVideo({ data } : { data: PohTaskData }) {
  const videoUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const phrases = data.wordList[0]
  const [videoObject, setVideoObject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(videoUrl);
      setVideoObject(urlObject);
    };
    fetchData();
  }, []);

  return (
    <Card.Content>
      {videoObject ? (
        <video width="100%" height="auto" controls>
          <source src={videoObject} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <figure className="image is-16by9">
          <div className="loader is-loading p-6"
           style={{
             position: "absolute",
             top: 0,
             left: 0,
             right: 0,
             bottom: 0
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
  )
};