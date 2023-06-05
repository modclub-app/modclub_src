import Link from "next/link";
import Styles from "./styles.module.scss";

export default function SectionFour() {
  return (
    <section
      className={`py-0 md:pt-44 pb-28 px-14 md:px-40 w-full ${Styles.sectionFour}`}
    >
      <div className="container text-center lg:p-24 my-40 md:my-36 mx-auto">
        <div className={Styles.main}>
          <h2 className="text-main">
            Offload your content moderation and focus on what matters most -
            your product and community.
          </h2>
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
