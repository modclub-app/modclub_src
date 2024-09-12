import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

import { XSvg, DiscordSvg, TelegramSvg } from './IconsSvg';

const social = [{
  name: 'X',
  url: 'https://x.com/DecideAI_',
  alias: 'x',
  comp: XSvg,
}, {
  name: 'Discord',
  url: 'https://discord.gg/decideai',
  alias: 'discord',
  comp: DiscordSvg,
}, {
  name: 'Telegram',
  url: 'https://t.me/Decide_AI',
  alias: 'telegram',
  comp: TelegramSvg
}]

export const SocialIcons = () => (
  <div className={cn("social-icons")}>
    {social.map((item) => {
      const CompIcon = item.comp;
      return (
        <a 
          key={item.alias}
          href={item.url}
          target="_blank"
          className={cn("social-link")}
        >
          <CompIcon />
        </a>
      )
    })}
  </div>
);