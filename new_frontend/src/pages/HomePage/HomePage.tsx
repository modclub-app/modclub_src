import SectionOne from "./components/SectionOne";
import SectionTwo from "./components/SectionTwo";
import SectionThree from "./components/SectionThree";
import SectionFour from "./components/SectionFour";
import SectionFive from "./components/SectionFive";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Styles from "./styles.module.scss";

export default function HomePage() {
  return (
    <main
      className={`${Styles.main} flex min-h-screen flex-col items-center justify-between`}
    >
      <Header />
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />
      <Footer />
    </main>
  );
}
