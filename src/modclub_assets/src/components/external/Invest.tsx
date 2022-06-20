import * as React from 'react'
import { Link } from "react-router-dom";
import { Section, Hero, Container, Heading } from "react-bulma-components";
import "./Invest.scss";

export default function Invest() {

  const rawHTML = `
  <div formsappId="6269844e9df3556adb09e87e"></div>
  <script src="https://my.forms.app/static/iframe.js" type="text/javascript"></script>
  <script>
    new formsapp('6269844e9df3556adb09e87e', {
      width: '100%',
      height: 'formHeight'
    });
  </script>`

  return (
    <div className="landing-page info has-background-black has-text-silver pb-6">
      <Hero size="medium" gradient={true}>
        <Hero.Body className="has-text-centered">
          <Container>
            <Heading>
              MODCLUB Private Round
            </Heading>
            <p>More information about our private round will be shared soon.</p>
            <p>Link to our <a href="https://docsend.com/view/5favhp34uadwm36d">Investor Deck</a></p>
            <p>Read our <a href="https://docsend.com/view/hxha6r7ciutbgzfc">Whitepaper</a></p>
          </Container>
        </Hero.Body>
      </Hero>
      <Section>
        <Container className="is-fullheight">
          <iframe title="modclub-form" className="modclub-form" srcDoc={rawHTML}></iframe>
          </Container>    
      </Section>
    </div>
  )
}