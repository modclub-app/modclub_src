type GTMEvent = {
  event: string;
  [key: string]: any;
};

const GTMManager = {
  _pushToDataLayer: (event: GTMEvent): void => {
    if (window && window.dataLayer) {
      window.dataLayer.push(event);
    }
  },

  trackEvent: (eventName: string, eventData: object): void => {
    GTMManager._pushToDataLayer({ event: eventName, ...eventData });
  },
};

export default GTMManager;
