import { Progress } from "react-bulma-components";

export default function Progress_({ value, min }) {
  return (
    <div
      className="progress-wrap"
      style={{
        height: "1.5rem",
        position: "relative",
        width: 100,
      }}
    >
      <Progress
        value={value}
        max={min}
        style={{
          height: "1.5rem",
          borderRadius: 4,
          width: 100
        }}
      />
      <span style={{
        color: "white",
        width: "100%",
        fontSize: ".75rem",
        lineHeight: "1.5rem",
        textAlign: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        {`${value}/${min} votes`}
      </span>
    </div>
  )

}