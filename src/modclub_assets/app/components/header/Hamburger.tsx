import React from "react";
import styled from "styled-components";
import "./Hamburger.scss";
import { HashLink } from "react-router-hash-link";

const StyledMenu = styled.nav`
  // display: flex;
  flex-direction: column;
  justify-content: center;
  background: #111215;
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
  display: ${({ open }) => (open ? "flex" : "none")};
  text-align: left;
  padding: 2rem;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 1023px) {
    width: 100%;
  }

  a {
    font-size: 2rem;
    padding: 2rem 0;
    font-weight: bold;

    color: #fff;
    text-decoration: none;
    transition: color 0.3s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #343078;
    }
  }
`;

const Menu = ({ open }) => {
  return (
    <StyledMenu open={open}>
      <HashLink to="/#developers">Developers</HashLink>
      <HashLink to="/#tokenomics">Tokenomics</HashLink>
      <HashLink to="/#roadmap">Roadmap</HashLink>
      <a href="https://docsend.com/view/hxha6r7ciutbgzfc">Whitepaper</a>
      <div className="column" style={{ display: "none" }}>
        <button
          className="DarkButton"
          style={{ height: 60, width: 200, marginTop: 20, marginBottom: 10 }}
        >
          Login
        </button>
      </div>
      <div className="column" style={{ display: "none" }}>
        <button className="BlueButton BurgerButtons">Sign Up</button>
      </div>
    </StyledMenu>
  );
};

const StyledBurger = styled.button`
  position: absolute;
  top: 4%;
  right: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  &:focus {
    outline: none;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: ${({ open }) => (open ? "#EFFFFA" : "#EFFFFA")};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-child {
      transform: ${({ open }) => (open ? "rotate(45deg)" : "rotate(0)")};
    }

    :nth-child(2) {
      opacity: ${({ open }) => (open ? "0" : "1")};
      transform: ${({ open }) => (open ? "translateX(20px)" : "translateX(0)")};
    }

    :nth-child(3) {
      transform: ${({ open }) => (open ? "rotate(-45deg)" : "rotate(0)")};
    }
  }
`;

const Burger = ({ open, setOpen }) => {
  return (
    <StyledBurger open={open} onClick={() => setOpen(!open)}>
      <div />
      <div />
      <div />
    </StyledBurger>
  );
};

const Hamburger = () => {
  const [open, setOpen] = React.useState(false);
  const node = React.useRef();
  return (
    <div id="Hamburger" ref={node}>
      <Burger open={open} setOpen={setOpen} />
      <Menu open={open} />
    </div>
  );
};

const useOnClickOutside = (ref, handler) => {
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

export default Hamburger;
