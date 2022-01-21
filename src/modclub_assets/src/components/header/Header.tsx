import * as React from 'react'
import { HashLink } from "react-router-hash-link";
import { Navbar, Container, Image, Heading } from "react-bulma-components";
import LogoImg from "../../../assets/logo.png";
import Hamburger from "./Hamburger";

export default function Header() {
  return (
    <Navbar backgroundColor="black" className="py-5">
      <Container>
        <Navbar.Brand>
          <a id='main' href="/">
            <div className="is-flex is-align-items-center">
              <Image src={LogoImg} size={32} />
              <Heading className="ml-2" style={{ fontFamily: "sans-serif" }}>
                MODCLUB
              </Heading>
            </div>
          </a>

          <Hamburger />
          
        </Navbar.Brand>
        <Navbar.Menu>
          <Navbar.Container align="right">
            <HashLink className="navbar-item" to="/#developers">
              Developers
            </HashLink>
            <HashLink className="navbar-item" to="/#tokenomics">
              Tokenomics
            </HashLink>
            <HashLink className="navbar-item" to="/#roadmap">
              Roadmap
            </HashLink>
          </Navbar.Container>
        </Navbar.Menu>
      </Container>
    </Navbar>
  )
}