import LogoImg from '../../../assets/logo.png';
import "./LogoComponent.scss";

export default function Logo() {
  return (<a id='main' href="/">
    <div className="Logo">
      <img src={LogoImg} />
      <p> MODCLUB </p>
    </div>
  </a>
  )
};