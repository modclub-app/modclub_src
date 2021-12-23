import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";
import State "./state";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug"; 
import PohTypes "./types";

module Poh {

    // Step 2 of Poh design doc on paper
    //The dApp checks with MODCLUB if the users Principal ID has already done POH. 
    // In this request the dApp can send a list of POH checks 
    // ( i.e Government ID verified, Social Networks linked etc.. ) that they required to be verified.
    public func verifyForHumanity(pohVerificationRequest: PohTypes.PohVerificationRequest) : PohTypes.PohVerificationResponse;

    // Step 4 The dApp asks the user to perform POH and presents an iFrame which loads MODCLUB’s POH screens.
    // Modclub UI will ask for all the challenge for a user to show
    // ResponseType of this function is yet to be designed.
    public func retrieveChallengesForUser(userId: Principal);

    // Step 5 The user provides all POH evidence that the dApp requested.
    // one challenege =  PohChallengeSubmissionRequest. Hence using array here
    // User can come in multiple times and submit one challenge a time. Array will allow that

    public func submitChallengeData(pohDataRequests : [PohTypes.PohChallengeSubmissionRequest]) : ;

    // Step 6 MODCLUB mods verify that user data and approve the user. The 
    // dApp is then notified that the user has verified their POH.
    public func changeChallengeTaskStatus(challengeId: Nat, status: {#notSubmitted; #pending; #verified; #rejected;}) : ;

    // This function will be called from changeChallengeTaskStatus function when all challenges are complete
    // And this function will provide a callback to provider about the status completion of a user.
    func completeUserPoh();

};