import { hideStringWithStars } from "./util";

export enum GTMEvent {
  // todo
}

type GTMEventTypes = {
  event: string;
  [key: string]: any;
};

export const GTMManager = {
  _pushToDataLayer: (event: GTMEventTypes): void => {
    if (window && window.dataLayer) {
      window.dataLayer.push(event);
    }
  },

  trackEvent: (
    eventName: GTMEvent,
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
