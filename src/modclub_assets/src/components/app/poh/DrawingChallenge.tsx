import * as React from 'react'
import { useEffect, useState } from "react";
import { Card } from "react-bulma-components";
import { getUrlForData, fetchObjectUrl } from "../../../utils/util";
import { PohTaskData } from '../../../utils/types';

import circle from '../../../../assets/shapes/circle.png';
import triangle from '../../../../assets/shapes/triangle.png';
import smiley from '../../../../assets/shapes/smile.png';
import square from '../../../../assets/shapes/square.png';
import star from '../../../../assets/shapes/star.png';

export default function DrawingChallenge({ data } : { data: PohTaskData }) {
  const imageUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const [urlObject, setUrlObject] = useState(null);
  const shapes = data.wordList[0]

  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
  }, []);

  let drawShape = (shape: String) => {
    switch (shape.toLowerCase()) {
      case "circle":
        return (<img src={circle} />);
      case "triangle":
        return (<img src={triangle} />);
      case "smile":
        return (<img src={smiley} />);
      case "square":
        return (<img src={square} />);
      case "star":
        return (<img src={star} />);
    }
  };

  return (
    <Card.Content>
      {urlObject ? (
        <img
          src={urlObject}
          alt="Image File"
          style={{
            display: "block",
            margin: "auto",
            maxHeight: 640
          }}
        />
      ) : (
        <figure className="image is-5by4">
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
        <div style={{
        display: "flex",
        flexWrap: "nowrap",
        backgroundColor: "#fff",
        marginTop: 50,
        marginBottom: 50
          }}>
          {shapes.map((shape, index) => (
            <span id={shape} style={{margin:"auto"}}>
              {drawShape(shape)}
             </span>
          ))}
        </div>
    </Card.Content>
  )
};