import { hideStringWithStars } from "./util";

export enum GTMEvent {
  // --- User create profile event name ---
  UserCreatedProfileEventName = "gtm_create_profile",

  // --- Poh challenge start event name ---
  PohChallengeEventName = "gtm_poh_challenge",

  // --- Account transaction event name ---
  TransactionEventName = "gtm_transaction",

  // --- Human verification event name ---
  HumanVerificationEventName = "gtm_human_verification",

  // --- Task vote event name ---
  TaskVoteEventName = "gtm_task_vote",
}

export enum GTMTypes {
  // --- User create profile event type and element id ---
  UserCreatedProfileEventType = "create_profile",

  // --- Poh challenge events type and elements id ---
  PohStartEventType = "start",
  PohCompletedAudioEventType = "completed_audio",
  PohCompletedVideoEventType = "completed_video",
  PohCompletedEventType = "completed",

  // --- Account transaction events type and elements id ---
  TransactionDepositEventType = "deposit",
  TransactionWithdrawEventType = "withdraw",
  TransactionStakeEventType = "stake",
  TransactionUnStakeEventType = "unstake",
  TransactionClaimEventType = "claim",

  // --- Human verification events type and elements id ---
  HumanVerificationReserveEventType = "reserve",
  HumanVerificationExpiredEventType = "reserve_expired",
  HumanVerificationVotedEventType = "human_verification_voted",

  // --- Task vote events type and elements id ---
  TaskVotedApproveEventType = "voted_approve",
  TaskVotedRejectEventType = "voted_reject",
  TaskVoteReserveEventType = "task_reserve",
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
