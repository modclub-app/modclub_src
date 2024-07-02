import * as React from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import {
  Footer,
  Container,
  Columns,
  Image,
  Heading,
  Level,
} from "react-bulma-components";
import LogoImg from "../../../assets/full_logo_black.svg";

export default function Footer_() {
  const currentYear = new Date().getFullYear();

  return (
    <Footer>
      <Container marginless>
        <Columns>
          <Columns.Column size="one-fifth">
            <Image src={LogoImg} size={66} />
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle className="">Menu</Heading>
            <HashLink to="/#developers" className="is-block has-text-black">
              Developers
            </HashLink>
            <HashLink to="/#tokenomics" className="is-block has-text-black">
              Tokenomics
            </HashLink>
            <HashLink to="/#roadmap" className="is-block has-text-black">
              Roadmap
            </HashLink>
            <Link to="/how-to" className="is-block has-text-black">
              How To
            </Link>
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle className="">Company</Heading>
            <a
              href="mailto:team@modclub.app"
              className="is-block has-text-black"
            >
              Contact
            </a>
            <Link to="/privacy" className="is-block has-text-black">
              Privacy Policy
            </Link>
            <Link to="/terms" className="is-block has-text-black">
              Terms of Service
            </Link>
          </Columns.Column>
        </Columns>

        <hr />

        <Level>
          <p className="has-text-silver">&copy; DecideAI DAO LLC {currentYear}</p>
          <a href="#" className="has-text-silver">
            Go to the top
          </a>
        </Level>
      </Container>
    </Footer>
  );
}
