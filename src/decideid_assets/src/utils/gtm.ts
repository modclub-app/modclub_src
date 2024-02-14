import { hideStringWithStars } from "./util";

export enum GTMEvent {}
// todo

type GTMEventTypes = {
  event: string;
  [key: string]: any;
};

export const GTMManager = {
  // @ts-ignore
  _pushToDataLayer: (event: GTMEventTypes): void => {
    if (window && window.dataLayer) {
      window.dataLayer.push(event);
    }
  },

  trackEvent: (
    eventName: string,
    eventData: Record<string, any>,
    fieldsToHide?: string[]
  ): void => {
    if (fieldsToHide) {
      fieldsToHide.forEach((field) => {
        if (eventData.hasOwnProperty(field)) {
          eventData[field] = hideStringWithStars(eventData[field]);
        }
      });
    }

    GTMManager._pushToDataLayer({ event: eventName, ...eventData });
  },
};
