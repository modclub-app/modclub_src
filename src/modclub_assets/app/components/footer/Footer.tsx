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
import modclubImg from "../../../assets/logo.png";

export default function Footer_() {
  return (
    <Footer backgroundColor="black">
      <Container marginless>
        <Columns>
          <Columns.Column size="one-fifth">
            <Image src={modclubImg} size={64} />
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle>Menu</Heading>
            <HashLink to="/#developers" className="is-block has-text-white">
              Developers
            </HashLink>
            <HashLink to="/#tokenomics" className="is-block has-text-white">
              Tokenomics
            </HashLink>
            <HashLink to="/#roadmap" className="is-block has-text-white">
              Roadmap
            </HashLink>
            <Link to="/how-to" className="is-block has-text-white">
              How To
            </Link>
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle>Company</Heading>
            <a
              href="mailto:team@modclub.app"
              className="is-block has-text-white"
            >
              Contact
            </a>
            <Link to="/privacy" className="is-block has-text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="is-block has-text-white">
              Terms of Service
            </Link>
          </Columns.Column>
        </Columns>

        <hr />

        <Level>
          <p className="has-text-silver">&copy; MODCLUB Foundation 2023</p>
          <a href="#" className="has-text-silver">
            Go to the top
          </a>
        </Level>
        <Level>
          <p className="has-text-silver">
            MODCLUB FOUNDATION Torre Advanced Building, 1st Floor Ricardo Arlas
            Street Panama City, Republic of Panama
          </p>
        </Level>
      </Container>
    </Footer>
  );
}
