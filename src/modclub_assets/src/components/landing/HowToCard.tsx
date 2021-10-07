import "./HowToCard.scss";
import Card from "../common/Card";

interface Props {
  title: string;
  desc: string;
}

export default function HowToCard(props: Props) {
  return (
    <Card>
      <div className="HowTo">
        <p className="title">{props.title}</p>
        <span className="desc">{props.desc}</span>
      </div>
    </Card>
  )
}