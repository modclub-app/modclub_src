import { hideStringWithStars } from "./util";

export enum GTMEvent {
  // --- User create profile event name ---
  UserCreatedProfileEventName = "gtm_create_profile",
  // --- User create profile event type and element id ---
  UserCreatedProfileEventType = "create_profile",

  // --- Poh challenge start event name ---
  PohChallengeEventName = "gtm_poh_challenge",
  // --- Poh challenge events type and elements id ---
  PohStartEventType = "start",
  PohCompletedVideoEventType = "completed_video",
  PohCompletedAudioEventType = "completed_video",
  PohCompletedEventType = "completed",

  // --- Account transaction event name ---
  TransactionEventName = "gtm_transaction",
  // --- Account transaction events type and elements id ---
  TransactionDepositEventType = "deposit",
  TransactionWithdrawEventType = "withdraw",
  TransactionStakeEventType = "stake",
  TransactionUnStakeEventType = "unstake",
  TransactionClaimEventType = "claim",

  // --- Human verification event name ---
  HumanVerificationEventName = "gtm_human_verification",
  // --- Human verification events type and elements id ---
  HumanVerificationReserveEventType = "reserve",
  HumanVerificationExpiredEventType = "reserve_expired",
  HumanVerificationVotedEventType = "gtm_human_verification_voted",
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
