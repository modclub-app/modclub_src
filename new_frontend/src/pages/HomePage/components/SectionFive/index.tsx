import Link from "next/link";
import { Disclosure, Transition } from "@headlessui/react";
import Styles from "./styles.module.scss";

export default function SectionFive() {
  return (
    <section
      className={`py-40 md:py-72 px-14 md:px-40 ${Styles.sectionFive} rounded-3xl w-full`}
    >
      <div className="md:px-3 text-main">
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-span-10">
            <h2>Know More</h2>
          </div>
        </div>
        <div className="header-center">
          <div className="w-full">
            <div className={`${Styles.faq} mx-auto w-full rounded-2xl p-2`}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="mt-16 mb-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Tokenomics
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>
                          Modclub&#39;s tokenomics model was developed in
                          collaboration with{" "}
                          <Link
                            target="_blank"
                            href="https://e6p3u-6yaaa-aaaah-abkfq-cai.ic0.app/"
                            className={`${Styles.link} text-secondary`}
                          >
                            Quantum Economics
                          </Link>
                          , a research department of{" "}
                          <Link
                            href="https://www.bochslerfinance.com/"
                            target="_blank"
                            className={`${Styles.link} text-secondary`}
                          >
                            Bochsler Consulting
                          </Link>
                          .
                        </p>
                        <p>
                          To learn more about Modclub&#39;s tokenomics model you
                          can access our{" "}
                          <Link
                            href="https://docsend.com/view/e9c3jdq6thia938y"
                            target="_blank"
                            className={`${Styles.link} text-secondary`}
                          >
                            Tokenomics Paper
                          </Link>
                          .
                        </p>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="w-full">
            <div className={`${Styles.faq} mx-auto w-full rounded-2xl p-2`}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Whitepaper
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>
                          Learn more about Modclub! Read our{" "}
                          <Link
                            target="_blank"
                            href="https://docsend.com/view/cnyepz6x7jjwpgj3"
                            className={`${Styles.link} text-secondary`}
                          >
                            Whitepaper
                          </Link>
                          .
                        </p>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Become a Moderator
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>
                          Join Modclub&#39;s community moderators and help make
                          the internet a better place. Sign up now and moderate
                          to earn!
                        </p>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">FAQs</p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>What is Modclub?</p>
                        <ul>
                          <li>
                            Modclub is a comprehensive content moderation
                            platform that addresses the challenges of managing
                            user-generated content. The platform offers
                            customizable moderation rules, real-time
                            notifications, and powerful analytics to ensure
                            high-quality content and community safety.
                          </li>
                        </ul>

                        <p>
                          How does Modclub&#39;s content moderation platform
                          work?
                        </p>
                        <ul>
                          <li>
                            Modclub&#39;s platform combines AI capabilities with
                            human-powered decentralized moderation services. Our
                            AI algorithms help identify and address potential
                            issues in user-generated content, while our
                            community of moderators provides the human touch
                            necessary to maintain the quality and integrity of
                            your platform.
                          </li>
                        </ul>

                        <p>
                          What types of platforms can benefit from Modclub&#39;s
                          services?
                        </p>
                        <ul>
                          <li>
                            Modclub&#39;s services are designed to benefit
                            various platforms, including social media platforms,
                            online marketplaces, community forums, and any
                            platform that deals with user-generated content.
                          </li>
                        </ul>

                        <p>How can Modclub help protect my brand reputation?</p>
                        <ul>
                          <li>
                            By utilizing Modclub&#39;s content moderation
                            platform, you can ensure that your platform is
                            moderated in a fair and unbiased manner, protecting
                            your brand reputation by maintaining high-quality
                            content and fostering user trust.
                          </li>
                        </ul>

                        <p>Is Modclub&#39;s moderation process customizable?</p>
                        <ul>
                          <li>
                            Yes, Modclub offers customizable moderation rules
                            and parameters to meet your platform&#39;s specific
                            needs. Tailor the level of scrutiny, number of votes
                            required, and rewards given to moderators to align
                            with your unique requirements.
                          </li>
                        </ul>

                        <p>
                          How does Modclub ensure privacy and security of user
                          data?
                        </p>
                        <ul>
                          <li>
                            Modclub prioritizes the privacy and security of user
                            data. Our platform adheres to strict data protection
                            protocols and follows industry best practices to
                            ensure the confidentiality, integrity, and
                            availability of user information.
                          </li>
                          <li>
                            To give the moderation process added security,
                            rewards are locked for a defined period of time
                            before being released. During this period,
                            developers can review the results (and the
                            moderator’s past activity) and raise any objections.
                          </li>
                          <li>
                            Users signing up for Modclub platform as moderators
                            have to undergo a Proof of Humanity process. Data
                            collected in the Proof of Humanity process will be
                            deleted after a grace period of approximately 5 days
                            to ensure users data privacy.
                          </li>
                        </ul>

                        <p>
                          What sets Modclub apart from other content moderation
                          solutions?
                        </p>
                        <ul>
                          <li>
                            Modclub distinguishes itself by combining AI
                            capabilities with expert moderation services. AI
                            algorithms identify potential content issues, while
                            experienced human moderators provide the judgment
                            and context necessary to maintain the quality and
                            integrity of your platform. Modclub&#39;s platform
                            is highly customizable to suit your platform&#39;s
                            unique needs, ensuring seamless alignment with your
                            objectives and values.
                          </li>
                        </ul>

                        <p>How do I integrate with Modclub?</p>
                        <ul>
                          <li>
                            To get started with Modclub, simply visit our
                            website and sign up for an account. From there, you
                            can explore our platform, customize your moderation
                            parameters, and begin your journey towards efficient
                            and effective content moderation. Reach out to us
                            for access to our easy-to-use developer SDK.
                          </li>
                        </ul>

                        <p>What does the Modclub token do?</p>
                        <ul>
                          <li>
                            The MOD token is the core utility and governance
                            token of Modclub&#39;s platform. It serves as a
                            means of payment for DApp developers using
                            Modclub&#39;s verification services and for
                            rewarding moderators. MOD token holders who stake
                            their tokens in the Governance canister can
                            participate in the decision-making process.
                          </li>
                        </ul>

                        <p>
                          How can I become a moderator on Modclub and earn MOD
                          tokens?
                        </p>
                        <ul>
                          <li>
                            To become a Modclub moderator and earn MOD tokens,
                            sign up through our platform and complete our
                            internal Proof of Humanity process. Once approved,
                            you can start moderating content and earn MOD tokens
                            based on your contributions, performance, and
                            reputation score.
                          </li>
                          <li>
                            Join Modclub&#39;s community of moderators and help
                            make the internet a better place!
                          </li>
                        </ul>
                      </Disclosure.Panel>
                    </Transition>
                    <hr className="my-10" />
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
