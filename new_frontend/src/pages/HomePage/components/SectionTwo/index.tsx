import Image from "next/image";
import Styles from "./styles.module.scss";

export default function SectionTwo() {
  return (
    <section className={`${Styles.sectionTwo} py-20 md:py-80 rounded-3xl`}>
      <div className={`${Styles.headerCenter} text-left grid grid-cols-12`}>
        <div className="headerText col-start-2 md:col-start-2 col-span-10 md:col-span-4">
          <h2 className="leading-none">Reimagine online safety</h2>
          <p className={`${Styles.subText} mt-14 text-main text-4xl`}>
            Eliminate the risks, costs and resource burden of in-house content
            moderation and user verification.
          </p>
        </div>
      </div>
      <div className="cards-area grid mt-20 grid-cols-12 gap-x-1 text-center text-white">
        <div
          className={`card items-center md:items-end ${Styles.cardOne} col-span-10 md:col-span-6 col-start-2 md:col-start-2`}
        >
          <div className="my-auto">
            <Image
              src="/assets/cost-effective.svg"
              width={200}
              height={200}
              alt="Card 1 Image"
              className="w-10/12 xl:w-8/12 mx-auto"
            />
            <div className="mx-10 md:mx-20 mt-14">
              <h3 className="leading-none">Cost-Effective</h3>
              <p>
                Reduce your content moderation costs with flexible pricing plans
                that leverage the power of decentralization, allowing you to pay
                only for what you use.
              </p>
            </div>
          </div>
        </div>
        <div
          className={`relative card items-center md:items-start ${Styles.cardTwo} mt-1 md:mt-0 col-span-10 col-start-2 md:col-span-4`}
        >
          <div className="h-full">
            <div className="mx-10 md:mx-16 mb-12 pt-28 md:pt-20 ">
              <h3 className="leading-none">Customizable</h3>
              <p>
                Tailor your settings to suit your unique requirements -
                including your platform rules, training auto-moderation, and
                setting user verification levels.
              </p>
            </div>
            <Image
              src="/assets/section-two-card-2.svg"
              width={500}
              height={500}
              alt="Card 1 Image"
              className="mx-auto absolute bottom-0"
            />
          </div>
        </div>
      </div>
      <div className="cards-area grid mt-1 grid-cols-12 gap-x-1 text-center text-white">
        <div
          className={`card items-center ${Styles.cardThree} col-span-10 md:col-span-4 col-start-2 md:col-start-2`}
        >
          <div className="mx-10 md:mx-20">
            <h3 className="leading-none">Efficient</h3>
            <p>
              AI filtering moderates large volumes of user-generated content
              with speed and accuracy.
            </p>
          </div>
        </div>
        <div
          className={`relative card items-center md:items-start ${Styles.cardFour} mt-1 md:mt-0 col-span-10 col-start-2 md:col-span-6`}
        >
          <div className="grid">
            <div className="mx-10 md:mx-20 my-auto -mt-52 md:mt-40">
              <h3 className="leading-none">Analytics</h3>
              <p>
                Powerful analytics allow you to track your moderation
                performance, gain insights into user behavior, and make
                data-driven decisions to improve your platform.
              </p>
            </div>
            <Image
              src="/assets/section-two-card-4.svg"
              width={500}
              height={500}
              alt="Card 1 Image"
              className="float-right bottom-0 right-0 absolute"
            />
          </div>
        </div>
      </div>
    </section>
  );
}