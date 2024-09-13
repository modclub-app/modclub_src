import React from 'react';
import classNames from 'classnames/bind';

// Components
import { DecideIdDecore } from './DecideIDDecor';
import { Gpt2Decor } from './Gpt2Decor';
import { RedactorDecor } from './RedactorDecor';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

const animation = {
  decideid: DecideIdDecore,
  gpt2: Gpt2Decor,
  redactor: RedactorDecor
}

export const SpotlightPreview: React.FC<{
  title: string;
  subTitle: string;
  alias: string;
  href: string;
  animate?: boolean;
}> = ({
  title,
  subTitle,
  alias,
  href,
  animate = false,
}) => {
  const AnimComponent = animation[alias] || DecideIdDecore;
  return (
    <div className={cn("spotlight")}>
      <a href={href} className={cn("spotlight-link")} />
      <div className={cn("spotlight-container")}>
        <div className={cn("spotlight-image")}>
          <AnimComponent animate={animate} />
        </div>
        <div className={cn("spotlight-content", { "highlight": animate })}>
          <div className={cn("spotlight-title")}>{title}</div>
          <div className={cn("spotlight-subtitle")}>{subTitle}</div>
          <div className={cn("spotlight-fakebutton")}>Try now</div>
        </div>
      </div>
    </div>
  )
}