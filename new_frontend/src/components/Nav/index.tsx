import Image from "next/image";
import Link from "next/link";
import Styles from "./styles.module.scss";

export default function Nav() {
  return (
    <nav
      className={`${Styles.nav} flex justify-between px-10 md:px-20 py-10 text-white`}
    >
      <div className={`${Styles.navBrand} gap-x-3 flex`}>
        <Image
          src="/assets/logo-icon.svg"
          height={18}
          width={50}
          alt="Logo Icon"
        />
        <Image
          className="my-auto hidden sm:block"
          src="/assets/logo-text.svg"
          height={120}
          width={120}
          alt="Logo Icon"
        />
      </div>
      <div className={Styles.navItems}>
        <ul className="flex gap-x-4">
          <li className="gap-x-3">
            <Link
              href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
              target="_blank"
            >
              <button className="primary-btn p-0">Sign Up</button>
            </Link>
          </li>
          <li>
            <Link href="https://modclub.app/#/app" target="_blank">
              <button className="secondary-btn">Moderator Login</button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
