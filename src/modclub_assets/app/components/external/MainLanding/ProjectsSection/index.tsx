import React, { useState } from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { SpotlightPreview } from './SpotlightPreview';
import { Title } from './Title';

const data = [{
  alias: "decideid",
  title: "Decide ID",
  subTitle: "Unique Identity Verification for Trustworthy Digital Engagements",
  href: "https://id.decideai.xyz/",
}, {
  alias: "gpt2",
  title: "GPT-2",
  subTitle: "A fully on-chain GPT-2 implementation – both front-end and backend hosted on the Internet Computer",
  href: "https://2zge7-4qaaa-aaaao-a3plq-cai.icp0.io/",
}, {
  alias: "redactor",
  title: "Redactor v0.1",
  subTitle: "A fully on chain abusive language detector. Enter some text to evaluate it by the model. The model increases the blur of text.",
  href: "https://hpbsv-4aaaa-aaaao-a3kta-cai.icp0.io/"
}]

export const ProjectsSection = () => {
  const [isHoverAlias, setIsHoverAlias] = useState<string | null>(null);
  const handleMouseEnter = (alias: string) => setIsHoverAlias(alias);
  const handleMouseLeave = () => setIsHoverAlias(null);

  return (
    <section className={cn("projects-section")}>
      <Title />
      <ul className={cn("list")}>
        {data.map(item => (
          <li 
            onMouseEnter={() => handleMouseEnter(item.alias)}
            onMouseLeave={handleMouseLeave}
            key={item.alias}
            className={cn("list-item", { 
              '_large': item.alias === 'decideid'
            })}
          >
            <SpotlightPreview
              animate={(item.alias === isHoverAlias)}
              title={item.title}
              subTitle={item.subTitle}
              alias={item.alias}
              href={item.href}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}