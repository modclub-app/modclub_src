import * as React from 'react'
import { Section, Hero, Container, Heading } from "react-bulma-components";

export default function Privacy() {
  return (
    <div className="landing-page has-background-black has-text-silver pb-6">
      <Hero size="medium" gradient={true}>
        <Hero.Body className="has-text-centered">
          <Container>
            <Heading>
              Privacy Policy
            </Heading>
            <p>Last Updated: February 8, 2022</p>
          </Container>
        </Hero.Body>
      </Hero>

      <Section>
        <Container>
          <p className="mb-4">This privacy policy (the <span className="has-text-white has-text-weight-bold">“Privacy Policy”</span>) explains how Modclub Foundation (<span className="has-text-white has-text-weight-bold">“we”</span>, <span className="has-text-white has-text-weight-bold">“our”</span> and <span className="has-text-white has-text-weight-bold">“us”</span>) collects, uses, stores and discloses information about users (<span className="has-text-white has-text-weight-bold">“users”</span>, <span className="has-text-white has-text-weight-bold">“you”</span> and <span className="has-text-white has-text-weight-bold">“your”</span>) through our websites, forums and blogs (collectively the <span className="has-text-white has-text-weight-bold">“Sites”</span>) and our web applications and other online products and services (collectively, the <span className="has-text-white has-text-weight-bold">“Services”</span>) or when you otherwise interact with us.</p>
          <p>By using the Sites or the Services, you accept the terms of this Privacy Policy and our terms of service (the <span className="has-text-white has-text-weight-bold">“Terms of Service”</span>), and consent to our collection, use, disclosure, and retention of your information as described in this Privacy Policy. If you have not done so already, please also review our Terms of Service. The Terms of Service contain provisions that limit our liability to you and require you to resolve any dispute with us on an individual basis and not as part of any class or representative action. If you do not agree with any part of this Privacy Policy or our Terms of Service, then please do not use the Sites or any of the Services.</p>
        </Container>
      </Section>

      <Section>
        <Heading className="has-text-centered">
          Collection of Information
        </Heading>
        <Container>
          <Heading subtitle>
            Information You Provide To Us
          </Heading>
          <p>We collect information you provide directly to us. This may include:</p>
          <ul style={{ listStyle: "disc" }}>
            <li>contact information, such as email address;</li>
            <li>feedback and correspondence, such as information you provide in your responses to surveys, when you participate in market research activities, report a problem with the Services, receive customer support or otherwise correspond with us;</li>
            <li>usage information, such as information about how you use the Services and interact with us; and</li>
            <li>marketing information, such as your preferences for receiving marketing communications and details about how you engage with them.</li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Automatically Collected Information
          </Heading>
          <p className="mb-4">When you access or use the Sites or our Services, we automatically collect information about you, which may include:</p>
          <label className="label">Log Information:</label>
          <p className="mb-4">We may collect log information about your use of the Sites and the Services, including the type of browser you use, access times, pages viewed, your IP address and the page you visited before navigating to the Sites or our Services.</p>

          <label className="label">Device Information:</label>
          <p className="mb-4">We may collect information about the computer or mobile device you use to access the Sites and our Services, including the hardware model, operating system and version, unique device identifiers, and mobile network information.</p>

          <label className="label">Information Collected by Cookies and Other Tracking Technologies:</label>
          <p className="mb-4">We may use various technologies to collect information, including cookies and web beacons. Cookies are small data files stored on your hard drive or in device memory that help us improve the Sites, our Services and your experience, see which areas and features of the Sites and our Services are popular and count visits. Web beacons are electronic images that may be used in the Sites and our Services or emails and help deliver cookies, count visits and understand usage and campaign effectiveness. For more information about cookies and how to disable them, please see “Your Choices” below.</p>
          
          <p className="mb-4">We may also use Google Analytics to help us offer you an optimized user experience. You can find more information about Google Analytics' use of your personal data here: <a href="https://policies.google.com/privacy?hl=en" target="_blank">https://policies.google.com/privacy?hl=en</a></p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Information We Collect from Other Sources
          </Heading>
          <p>We may obtain information from other sources, including third parties, and combine that with information we collect through the Sites and our Services.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Information We Will Never Collect
          </Heading>
          <p>We will never ask you to share your private keys or wallet seed. Never trust anyone or any site that asks you to enter your private keys or wallet seed.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Use of Information
          </Heading>
          <p>We use the information we collect to enable you to access and use and otherwise provide, maintain, and improve the Sites and our Services. We may also use the information we collect to:</p>
          <ul style={{ listStyle: "disc" }}>
            <li>send you technical notices, updates, security alerts and support and administrative messages and to respond to your comments, questions and customer service requests;</li>
            <li>communicate with you about products, services, offers, and events offered by us and others, and provide news and information we think will be of interest to you, which may be provided by any means, including by e-mail, in-app notifications, push notifications and display advertising;</li>
            <li>personalize your experience when you visit or use the Sites or our Services;</li>
            <li>administer contests, promotions, surveys and other Service features;</li>
            <li>monitor and analyze trends, usage and activities in connection with the Sites and our Services;</li>
            <li>comply with applicable laws, lawful requests and legal processes, including responding to court orders or requests from regulatory authorities;</li>
            <li>generate aggregate or de-identified data and use such data for any lawful purpose, including research and analytics; and</li>
            <li>detect, investigate and prevent fraudulent transactions and other illegal activities, enforce our agreements with users (including our Terms of Service) and protect our rights and property and of others.</li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Sharing of Information
          </Heading>
          <p>We do not share or sell the personal information that you provide us with other organizations without your express consent, except as described in this Privacy Policy. We disclose personal information to third parties under the following circumstances:</p>
          <ul style={{ listStyle: "disc" }}>
            <li>with vendors, consultants and other service providers who need access to such information to carry out work on our behalf, including hosting, email and database services;</li>
            <li>in response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation or legal process;</li>
            <li>if we believe your actions are inconsistent with our user agreements or policies (including our Terms of Service), or to protect our rights, property and our safety or that of others;</li>
            <li>in connection with, or during negotiations of, any proposed or actual merger, sale of company assets, financing, securitization, insuring, acquisition of all or a portion of our business by another company, or bankruptcy transaction or proceeding;</li>
            <li>between and among us and our current and future parents, affiliates, subsidiaries and other companies under common control and ownership; and</li>
            <li>With your consent or at your direction.</li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Advertising and Analytics Services Provided by Others
          </Heading>
          <p>We may allow others to provide analytics services and serve advertisements on our behalf across the internet and in applications. These entities may use cookies, web beacons, device identifiers and other technologies to collect information about your use of the Sites or the Services and other websites and applications, including your IP address, web browser, mobile network information, pages viewed, time spent on pages or in apps, links clicked and conversion information. This information may be used by us and others to, among other things, analyze and track data, determine the popularity of certain content, deliver advertising and content targeted to your interests on the Sites and our Services and other websites and better understand your online activity. For more information about interest-based ads, or to opt out of having your web browsing information used for behavioral advertising purposes, please visit www.aboutads.info/choices (or www.youronlinechoices.eu if you are a resident of the European Economic Area).</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Security
          </Heading>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Data Retention
          </Heading>
          <p>We store the information we collect about you for as long as is necessary for the purposes for which we originally collected it, or for other legitimate business purposes, including to meet our legal or other regulatory obligations, prevent fraud, resolve disputes, troubleshoot problems, assist with any investigation, enforce our Terms of Service, and other actions permitted by law. There is no single retention period applicable to the various types of personal information collected. Please contact us if you would like to delete any personal information we hold about you. We also reserve the right to continue to hold personal information about you to the extent it is required to be held by us by law, rule or regulation.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Disclaimer About Sharing Personal Information Online
          </Heading>
          <p>You acknowledge that when sharing personal information online, there is always a risk of data breaches, including data breaches in which third parties unlawfully access our systems or the systems of our third-party providers, which store personal information.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Limitation on Liability
          </Heading>
          <p>While we take measures to protect personal information, you agree that in no event will we, our suppliers, partners, licensors, dealers, representatives, associates or affiliates and each of their respective officers, directors, employees, shareholders, representatives and agents (collectively, the <span className="has-text-white has-text-weight-bold">“Company Parties”</span>) be liable to you or any other person in any way in contract, tort (including negligence), civil liability or otherwise for any claims, damages, obligations, losses, liabilities, costs, debts or expenses (including but not limited to lawyer’s fees and disbursements), whether direct, indirect, special, economic, incidental, consequential, punitive or exemplary, including without limitation loss of revenue, data, anticipated profits or lost business, howsoever caused, including by way of negligence, arising from, related to or connect with the loss or theft of your personal information. You agree that if, notwithstanding the other provisions of this Privacy Policy, a Company Party is found to be liable for any claims, proceedings, liabilities, obligations, damages, losses or costs, such Company Party’s liability shall in no event exceed the amount you paid to us hereunder during the 1-month period prior to the date on which the event giving rise to such claim arose, if any.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Transfer of Information to Other Countries
          </Heading>
          <p>We are based in Panama. However, we may transfer personal information to outside agents or service providers (including our affiliates acting in this capacity) that perform services on our behalf, such as customer service and support, marketing and analytics, data hosting or processing services or similar services. Some of these service providers may be located outside of Panama, including the United States, and as a result your personal information may be processed in the United States or elsewhere outside of Panama, where local laws may permit foreign government and national security authorities to access personal information in certain circumstances.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Residents of the European Economic Area
          </Heading>
          <p>If you are a resident of the European Economic Area (<span className="has-text-white has-text-weight-bold">“EEA”</span>), you have certain rights and protections under the law regarding the processing of your personal data. Any reference to “personal information” in this Privacy Policy should be understood as referring to “personal data”, defined under the General Data Protection Regulation (<span className="has-text-white has-text-weight-bold">“GDPR”</span>) as “any information relating to an identified or identifiable natural person (<span className="has-text-white has-text-weight-bold">“data subject”</span>); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person”.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Legal Basis for Processing
          </Heading>
          <p>If you are a resident of the EEA, when we process your personal data we will only do so in the following situations:</p>
          <ul style={{ listStyle: "disc" }}>
            <li>with your consent;</li>
            <li>to perform the Services you have requested from us or, upon your request, to take the steps necessary to provide you with such Services; or</li>
            <li>in the furtherance of our legitimate interests in maintaining business relationships and communicating with you as a business contact, about our activities and Services and providing, securing and improving our Services.</li>
          </ul>
          <p className="mt-4">You have consented to the processing of your personal data for one or more specific purposes. We consider that our legitimate interests are in compliance with the GDPR and your legal rights and freedoms. You have the right to object to any of this processing and, if you want to, please contact us at the contact details indicated below.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Data Subject Requests
          </Heading>
          <p>If you are a resident of the EEA, you have the right to access personal data we hold about you and to ask that your personal data be corrected, erased, or transferred. You may also have the right to object to, or request that we restrict, certain processing. If you would like to exercise any of these rights, you can contact us as indicated below. Please note that the limitation or deletion of your personal data may mean we will be unable to provide our Services. You also have the right to receive your personal data in a machine-readable format and have the data transferred to another party responsible for data processing.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Questions or Complaints
          </Heading>
          <p>If you are a resident of the EEA and have a concern about our processing of personal data that we are not able to resolve, you have the right to lodge a complaint with the data privacy authority where you reside. For contact details of your local Data Protection Authority, please see: <a href="http://ec.europa.eu/justice/data-protection/article-29/structure/data-protection-authorities/index_en.htm" target="_blank">http://ec.europa.eu/justice/data-protection/article-29/structure/data-protection-authorities/index_en.htm</a> .</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Residents of California
          </Heading>
          <p>California Civil Code Section § 1798.83 permits users who are California residents to request certain information, including the categories of personal information disclosed to third parties for their marketing purposes and the names and addresses of those third parties, regarding our disclosure of personal information to third parties for their direct marketing purposes, if any. If you are a California resident and you have questions about our practices with respect to sharing information with third parties and affiliates for their direct marketing purposes, please contact us as indicated in the “Contact Us” section below.</p>
        </Container>
      </Section>

      <Section>
        <Heading className="has-text-centered">
          Your Choices
        </Heading>
        <Container>
          <Heading subtitle>
            Account Information
          </Heading>
          <p className="mb-4">You may update, correct or delete information about you at any time by contacting us as indicated in the “Contact Us” section below. Please note that we may retain cached or archived copies of information about you for a certain period of time. You can request to change contact choices, opt-out of our sharing with others, and update your personal information and preferences.</p>
          
          <label className="label">Cookies</label>
          <p className="mb-4">Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of the Sites and our Services.</p>

          <label className="label">Promotional Communications</label>
          <p className="mb-4">You may opt out of receiving promotional communications from us by following the instructions in those communications or by contacting us as indicated in the “Contact Us” section below. If you opt out, we may still send you non-promotional emails, such as those about your account or our ongoing business relations.</p>

          <label className="label">Google Analytics</label>
          <p className="mb-4">You may exercise choices regarding the use of cookies from Google Analytics by going to <a href="https://tools.google.com/dlpage/gaoptout" target="_blank">https://tools.google.com/dlpage/gaoptout</a> and downloading the Google Analytics Opt-out Browser Add-on.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Changes to this Privacy Policy
          </Heading>
          <p className="mb-4">We may change this Privacy Policy at any time. We encourage you to periodically review this page for the latest information on our privacy practices. If we make any changes, we will change the Last Updated date above.</p>
          <p>Any modifications to this Privacy Policy will be effective upon our posting of the new terms and/or upon implementation of the changes to the Sites (or as otherwise indicated at the time of posting). In all cases, your continued use of the Sites or the Services after the posting of any modified Privacy Policy indicates your acceptance of the terms of the modified Privacy Policy.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading subtitle>
            Eligibility
          </Heading>
          <p>If you are under the age of majority in your jurisdiction of residence, you may use the Sites or the Services only with the consent of or under the supervision of your parent or legal guardian. If we learn that we have received any information directly from a child under age 13 without first receiving his or her parent's verified consent, we will use that information only to respond directly to that child (or his or her parent or legal guardian) to inform the child that he or she cannot use the Site or the Services and subsequently we will delete that information.</p>
        </Container>
      </Section>

      <Section className="mb-6">
        <Container>
          <Heading subtitle>
            Contact Us
          </Heading>
          <p>If you have any questions about this Privacy Policy, please contact us at: [insert email address].</p>
        </Container>
      </Section>
    </div>
  )
}