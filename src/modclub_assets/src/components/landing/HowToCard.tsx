import "./HowToCard.scss";
import Card from "../common/Card";

interface Props {
  title: string;
  desc: string;
  img: string;
  step: number;
}

export default function HowToCard(props: Props) {
  return (
    <Card>
      <div className="HowTo">
        <div className="titlePair">
        <span className="step">{'Step ' + props.step}</span>
        <span className="title">{props.title}</span>
        </div>
        <img src={props.img} className="pic"/>
        <span className="desc">{props.desc}</span>
      </div>
    </Card>
  )
}