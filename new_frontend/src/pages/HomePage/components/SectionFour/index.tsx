import Link from "next/link";
import Styles from "./styles.module.scss";

export default function SectionFour() {
  return (
    <section className={`py-0 md:pt-36 md:pb-20 w-full ${Styles.sectionFour}`}>
      <div className="container text-center mt-40 mb-28 md:my-36 mx-auto">
        <div className={Styles.main}>
          <h1 className="text-main">
            Offload your content moderation and focus on what matters most -
            your product and community.
          </h1>
          <Link
            href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
            target="_blank"
          >
            <button className="primary-btn mt-5 sm:mt-16 w-11/12 md:w-auto">
              Book a Demo
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
