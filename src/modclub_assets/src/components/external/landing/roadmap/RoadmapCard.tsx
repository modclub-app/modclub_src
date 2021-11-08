import Card from "../../../common/Card";
import "./Roadmap.scss";

interface Props {
  title: string;
  points: string[];
  direction?: string;
}

export default function RoadmapCard(props: Props) {
  const points = [];
  for (const p of props.points) {
    points.push(<li className="roadmapPoint">{p}</li>);
  }

  return (
    <Card arrowDirection={props.direction} disableOutline={true} align={props.direction}>
      <div className="rCard">
        <div className="roadmapTitle">{props.title}</div>
        <ul className="roadmapPoints">{points}</ul>
      </div>
    </Card>
  );
}
