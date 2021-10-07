import "./Header.scss";
import Logo from './LogoComponent';
import MenuItems from "./MenuItems";
import LoginSignup from "./LoginSignup";
export default function Header() {
  return (

    <div className="Outer">
      <div className="Header">
        <Logo />
        <MenuItems />
        <LoginSignup />
      </div>
    </div>
  )
}