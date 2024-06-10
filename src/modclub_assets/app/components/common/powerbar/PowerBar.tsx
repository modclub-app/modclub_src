import React from "react";
import { Progress } from "react-bulma-components";

interface PowerBarProps {
  points: number;
  gradient: boolean;
  align: AlignText;
  width: number;
  showMax: boolean;
}
type AlignText =
  | "start"
  | "end"
  | "left"
  | "right"
  | "center"
  | "justify"
  | "match-parent";
const PowerBar: React.FC<PowerBarProps> = ({
  points,
  gradient,
  align,
  width,
  showMax,
}) => {
  const pointsString = showMax ? `${points}/100` : `${points}`;
  return (
    <div
      className="progress-wrap"
      style={{
        position: "relative",
        height: "1.5rem",
        width: width,
        marginTop: "10px",
      }}
    >
      <Progress
        value={points}
        max={100}
        style={{
          height: "1.5rem",
          borderRadius: 4,
          width: width,
        }}
      />
      {gradient ? (
        <span
          style={{
            borderRadius: "5px",
            background: "-webkit-linear-gradient(right,#3d52fa, #c91988)",
            color: "#1b4444",
            width: "100%",
            fontSize: ".75rem",
            lineHeight: "1.5rem",
            textAlign: align,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {pointsString}
        </span>
      ) : (
        <span
          style={{
            color: "#1b4444",
            width: "100%",
            fontSize: ".75rem",
            lineHeight: "1.5rem",
            textAlign: align,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {pointsString}
        </span>
      )}
    </div>
  );
};

export default PowerBar;
