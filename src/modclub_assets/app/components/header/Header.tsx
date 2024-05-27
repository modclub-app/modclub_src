import React, { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { useHistory } from "react-router-dom";
import { Navbar, Container, Image, Button } from "react-bulma-components";
import { useConnect } from "@connect2icmodclub/react";
import LogoImg from "../../../assets/full_logo_black.svg";
import Hamburger from "./Hamburger";

export default function Header() {
  const history = useHistory();
  const { disconnect } = useConnect();
  const handleLogOut = async () => {
    disconnect();
  };

  const isMatchAppUrl = /^\/app/.test(history.location.pathname);

  return isMatchAppUrl ? null : (
    <Navbar backgroundColor="white" className="py-2">
      <Container>
        <Navbar.Brand>
          <div className="is-flex is-flex-direction-column">
            <a id="main" href="/">
              <Image src={LogoImg} size={155} />
              {process.env.DEV_ENV !== "production" &&
                process.env.DEV_ENV !== "prod" && (
                  <p>
                    {process.env.DEPLOYMENT_TAG
                      ? process.env.DEPLOYMENT_TAG
                      : process.env.DEV_ENV}
                  </p>
                )}
            </a>
          </div>

          <Hamburger />
        </Navbar.Brand>
        <Navbar.Menu className="is-align-items-center">
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
            <a
              className="navbar-item"
              href="https://docsend.com/view/hxha6r7ciutbgzfc"
            >
              Whitepaper
            </a>

            <div className="pl-3">
              <Button 
                color="primary"
                onClick={handleLogOut}
              >
                Logout
              </Button>
            </div>
          </Navbar.Container>
        </Navbar.Menu>
      </Container>
    </Navbar>
  );
}
