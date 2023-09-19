import * as React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Button,
  Icon,
} from "react-bulma-components";
import { formatDate, getUrlForData } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";

interface ReservedButton {
    packageId: string;
    Text?: string;
    imageUrl: string;
    urlObject: any;
    createdAt: any;
    isEnable: boolean;
}

export const ReservedPohButton = ({packageId, isEnable, Text, imageUrl, urlObject, createdAt}: ReservedButton)=>{
    return (<>
      {isEnable && packageId ? (
        <Link  
        to={`/app/poh/${packageId}`}
        className="card is-flex is-flex-direction-column is-justify-content-flex-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 70%), url(${
            imageUrl ? urlObject : placeholder
          })`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <Card.Header
          justifyContent="start"
          style={{ marginBottom: "auto", boxShadow: "none" }}
        ></Card.Header>
    
        <Card.Content style={{ paddingTop: "65%" }}>
        </Card.Content>
        <Card.Footer className="is-block">
          <Card.Header.Title>
            <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
              Submitted {formatDate(createdAt)}
            </span>
          </Card.Header.Title>
          {Text && isEnable && (<Button.Group
          className="is-flex-wrap-nowrap mt-5"
          style={{ paddingBottom: 10 }}
          >
            <Button
              fullwidth
              className="is-outlined"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <Icon align="left" size="small" className="has-text-white">
                {Text}
              </Icon>
            </Button>
          </Button.Group>)}
        </Card.Footer>
      </Link>
  
      ):(
        <Link  
      to={`/app/poh/${packageId}`}
      className="card is-flex is-flex-direction-column is-justify-content-flex-end"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 70%), url(${
          imageUrl ? urlObject : placeholder
        })`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      onClick={event=>event.preventDefault()}
    >
      <Card.Header
        justifyContent="start"
        style={{ marginBottom: "auto", boxShadow: "none" }}
      ></Card.Header>
  
      <Card.Content style={{ paddingTop: "65%" }}>
      </Card.Content>
      <Card.Footer className="is-block">
        <Card.Header.Title>
          <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
            Submitted {formatDate(createdAt)}
          </span>
        </Card.Header.Title>
      </Card.Footer>
    </Link>
      )}
      </>
    )
  }
