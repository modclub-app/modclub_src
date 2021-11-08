import "./TokenomicsBox.scss";
import GradientCard from "../../common/GradientCard";

interface Props {
  title: string;
  value: string;
}

export default function TokenomicsBox(props: Props) {
  return (
    <GradientCard>
      <div className="TokenomicsBox">
        <p className="TokenTitle">{props.title}</p>
        <span className="TokenValue">{props.value}</span>
      </div>
    </GradientCard>
  )
}