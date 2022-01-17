import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import ModClub "./modclub/modclub";
import File "./files";


actor {
    type SubscribeMessage = ModClub.SubscribeMessage;
    type ContentResult = ModClub.ContentResult;
    type Image = ModClub.Image;
    let MC = ModClub.ModClub;
    let file = File.File();

    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public func test() : async Text {
        // Register with Modclub
        let companyLogo = {
             data = file.SoccerBall;
            imageType = "image/jpeg";
        };
        let registerResult = await MC.registerProvider("TestApp", "Test App's Description", ?companyLogo);

        // Sub the callback
        await subscribe();

        // Add content rules
        await MC.addRules(["No violent content", "No drugs"]);

        // Update settings
        await MC.updateSettings({minVotes = 3; minStaked = 0});

        // Submit content to be reviewed by moderators
        let test1 = await MC.submitText("id_1", "Test 1 text", ?"Test 111 Title");
        let test2 = await MC.submitText("id_2", "Test 2 text", ?"Test 111 Title");
        let test3 = await MC.submitText("id_3", "Test 3 text", ?"Test 111 Title");
        return registerResult # "\n" # test1 # "\n" # test2 # "\n" # test3;
    };

    public func subscribe() : async() {
       await MC.subscribe({callback = voteResult;});
    };

    public func deregister() : async Text {
        await MC.deregisterProvider();
    };
    

    public func voteResult(result: ContentResult) {
        Debug.print(debug_show(result));
    };

     public func exampleToInitiatePOH(): async ({#notAttempted; #pending; #rejected; #expired; #verified;#notSubmitted;}, ?Text) {
        // userId to check if it's a human
        let userId = Principal.fromText("2vxsx-fae");
        // call to check humanity
        let response =  await MC.verifyForHumanity(userId);

        // User never tried to attempt humanity challenge
        if(response.challenges.size() == 0 ) {
            // submit user's userid specific to your application to ModClub
            let token = await MC.generateUniqueToken(userId);
            // Let the UI client know that user didn't attempt any challenge
            return (#notAttempted, ?token.token);
        };

        // if user has attempted challenge, iterate to find that all challenges
        // are not pending/rejected/expired or notSubmitted.
        // Provider can use any custom logic based on what user's individial challenge status is
        for(challenge in response.challenges.vals()) {
            if(challenge.status == #pending) {
                return (#pending, ?((await MC.generateUniqueToken(userId)).token));
            } else if(challenge.status == #rejected) {
                return (#rejected, ?((await MC.generateUniqueToken(userId)).token));
            } else if(challenge.status == #expired) {
                return (#expired, ?((await MC.generateUniqueToken(userId)).token));
            } else if(challenge.status == #notSubmitted) {
                return (#notSubmitted, ?((await MC.generateUniqueToken(userId)).token));
            };
        };
        // if status is not verified, then UI can start with POH workflow using token in the response
        return (#verified, null);
    };
   
};