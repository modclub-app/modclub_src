import * as React from "react";
import { useEffect, useState } from "react";
import { Card } from "react-bulma-components";
import { getUrlForData } from "../../../utils/util";
import { PohTaskData } from "../../../utils/types";
import { fetchObjectUrl } from "../../../utils/jwt";
import { useActors } from "../../../utils";

export default function ProfilePic({ data }: { data: PohTaskData }) {
  const imageUrl = getUrlForData(data.dataCanisterId, data.contentId[0]);
  const [urlObject, setUrlObject] = useState(null);
  const { modclub } = useActors();
  useEffect(() => {
    const fetchData = async () => {
      const urlObject = await fetchObjectUrl(modclub, imageUrl);
      setUrlObject(urlObject);
    };
    fetchData();
  }, []);

  return (
    <Card.Content>
      {urlObject ? (
        <img
          src={urlObject}
          alt="Image File"
          style={{
            display: "block",
            margin: "auto",
            maxHeight: 640,
          }}
        />
      ) : (
        <figure className="image is-5by4">
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
    </Card.Content>
  );
}
