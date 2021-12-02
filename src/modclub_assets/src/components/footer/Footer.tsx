import { HashLink } from "react-router-hash-link";
import { Footer, Container, Columns, Image, Heading, Level } from "react-bulma-components";
import modclubImg from "../../../assets/logo.png";

export default function Footer_() {
  return (
    <Footer backgroundColor="black" style={{ padding: "5rem 1.5rem" }}>
      <Container marginless style={{ padding: "0 4rem" }}>
      {/* <Container style={{ margin: "0 3rem" }}> */}
        <Columns>
          <Columns.Column size="one-fifth">
            <Image
              src={modclubImg}
              size={64}
            />
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle>
              Menu
            </Heading>
            <HashLink to="/#developers" className="is-block has-text-white">
              Developers
            </HashLink>
            <HashLink to="/#tokenomics" className="is-block has-text-white">
              Tokenomics
            </HashLink>
            <HashLink to="/#roadmap" className="is-block has-text-white">
              Roadmap
            </HashLink>
          </Columns.Column>
          <Columns.Column size="one-fifth">
            <Heading subtitle>
              Company
            </Heading>
            <a href="mailto:team@modclub.app" className="is-block has-text-white">
              Contact
            </a>
          </Columns.Column>
        </Columns>

        <hr />

        <Level>
          <p className="has-text-silver">
            &copy; 2021 MODCLUB. All Rights Reserved
          </p>
          <a href="#main" className="has-text-silver">
            Go to the top
          </a>
        </Level>
      </Container>
    </Footer>
  );
}
