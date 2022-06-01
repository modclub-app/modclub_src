import * as React from 'react'
import { Section, Hero, Container, Heading } from "react-bulma-components";
import { HashLink } from "react-router-hash-link";

export default function HowTo() {
  return (
    <div className="landing-page info has-background-black has-text-silver pb-6">
      <Hero size="medium" gradient={true}>
        <Hero.Body className="has-text-centered">
          <Container>
            <Heading>
              How to Use MODCLUB
            </Heading>

            <HashLink to="/how-to#Getting" className="is-block has-text-white">
              1. Getting your Internet Identity
            </HashLink>
            <HashLink to="/how-to#Getting" className="is-block has-text-white">
              1. Signing up to MODCLUB
            </HashLink>
            <HashLink to="/how-to#Getting" className="is-block has-text-white">
              1. Getting
            </HashLink>
            <HashLink to="/how-to#Getting" className="is-block has-text-white">
              1. Getting
            </HashLink>
            <HashLink to="/how-to#Getting" className="is-block has-text-white">
              1. Getting
            </HashLink>


          </Container>
        </Hero.Body>
      </Hero>

      <Section id="Getting">
        <Container>
          <Heading subtitle>
            Getting your Internet Identity 
          </Heading>
          <p className="mb-4">Head to <a href="https://identity.ic0.app/" target="_blank">https://identity.ic0.app/</a></p>
          <p>Register for your Internet Identity (important - make a note of your anchor number &amp; security keys, it is also good practice to anchor your identity to two devices to ensure you do not lose access)</p>
        </Container>
      </Section>

      <Section id="Signing">
        <Container>
          <Heading subtitle>
            Signing up to MODCLUB 
          </Heading>
          <p className="mb-4">Head to <a href="https://ljyte-qiaaa-aaaah-qaiva-cai.raw.ic0.app/#/" target="_blank">https://ljyte-qiaaa-aaaah-qaiva-cai.raw.ic0.app/#/</a></p>
          <ul style={{ listStyle: "disc" }}>
            <li>Log in with your Internet Identity</li>
            <li>Register with your email address &amp; password</li>
            <li>Complete your POH to start moderating</li>
            <li>(To reduce bot &amp; duplicate accounts we require all of our Mods to complete POH)</li>
          </ul>
        </Container>
      </Section>

      <Section id="POH">
        <Container>
          <Heading subtitle>
            POH 
          </Heading>
          <p className="mb-4">Once you are registered you will be directed to the POH feature of our platform</p>
          <ul style={{ listStyle: "disc" }}>
            <li>Provide a photo, either upload or take a photo with your devices camera</li>
            <li>Record yourself saying the randomly generated words </li>
            <li>Submit your POH</li>
            <li>Wait for approval</li>
          </ul>
          <p className="mt-4">Our mods that have already completed POH will need to approve or reject your submission, this process requires your submission to be reviewed by X number of moderators.</p>
        </Container>
      </Section>

      <Section id="Moderating">
        <Container>
          <Heading subtitle>
            Moderating content 
          </Heading>
          <p className="mb-4">Once your POH is approved you will be able to begin moderating content</p>
          <ul style={{ listStyle: "disc" }}>
            <li>Stake your tokens in order to vote (note some platforms will require more/less staked tokens to participate in moderation of their platform content)</li>
            <li>Click on a post that needs to be moderated</li>
            <li>Read the platforms rules &amp; guidelines</li>
            <li>Read/view the content &amp; either approve or reject the post</li>
            <li>Wait for result</li>
          </ul>
          <p className="my-4">If you have voted with the majority then you will be rewarded for your contribution, if you have voted in the minority then you will lose a percentage of tokens staked. This is to reduce moderators voting maliciously and reward moderators for their work.</p>
          <p>We allow platforms to reward those who moderate their content with their own platform token, this is at the discretion of the platforms themselves.</p>
        </Container>
      </Section>

      <Section id="Receiving" className="mb-6">
        <Container>
          <Heading subtitle>
            Receiving rewards 
          </Heading>
          <p className="mb-4">Once your moderation contributions have been completed you will receive your rewards in your MODCLUB wallet. We are working on a trust system, the more tokens you stake the more trusted you are as a moderator and the more rewards you will receive for your input in moderating content.</p>
          <p className="mb-4">Deliverables:</p>
          <ul style={{ listStyle: "disc" }}>
            <li>Document</li>
            <li>Video</li>
            <li>Pop-ups (in app)</li>
          </ul>
        </Container>
      </Section>
    </div>
  )
}