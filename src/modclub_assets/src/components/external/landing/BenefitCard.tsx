import "./BenefitCard.scss";
import Card from "../../common/Card";

interface Props {
  title: string;
  desc: string;
  img: string;
}

export default function BenefitCard(props: Props) {
  return (
    <Card>
      <div className="Benefit">
        <img src={props.img} className="BenefitPic"/>
        <div className="BenefitTitle">{props.title}</div>
        <div className="BenefitDesc">{props.desc}</div>
      </div>
    </Card>
  )
}