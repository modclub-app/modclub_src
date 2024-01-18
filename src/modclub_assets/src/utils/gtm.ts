import { hideStringWithStars } from "./util";

type GTMEventTypes = {
  event: string;
  [key: string]: any;
};

const GTMManager = {
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

export default GTMManager;
