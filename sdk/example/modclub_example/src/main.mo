import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import ModClub "./modclub/modclub";
import File "./files";

actor {

    let imageFile = File.File();

    public shared({caller}) func howToSubmitContentToModClub() : async () {
        // Assumption: SetUpModclub method has already been called
        // Submit content to be reviewed by moderators
        let test1 = await ModClub.getModClubActor(environment).submitText("id_1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", ?"Title for Text Content");
        let test2 = await ModClub.getModClubActor(environment).submitImage("id_4", imageFile.SoccerBall, "image/jpeg", ?"Title for Image Content" );
        let test3 = await ModClub.getModClubActor(environment).submitHtmlContent("id_5", "<p>Sample Html Content</p>", ?"Title for Html Content" );
    };

    public shared ({caller}) func modClubCallback(result: ModClub.ContentResult) {
        Debug.print(debug_show(result));
    };

    stable var environment = "local";
    stable var modClubRulesAdded = false;
    public shared({caller}) func setUpModClub(env: Text) {
        // Restrict the caller to admins or trusted identites only.
        if(env != "local" and env != "staging" and env != "prod") {
            throw Error.reject("Please Provide correct environment value");
        };
        environment := env;
        // On local don't set up Modclub
        if(environment == "local") {
            return;
        };
        let companyLogo : ModClub.Image = {
            data = imageFile.SoccerBall;
            imageType = "image/jpeg";
        };
        let _ = await ModClub.getModClubActor(environment).registerProvider("AppName", "AppDescription", ?companyLogo);
        if(not modClubRulesAdded) {
            let rules = ["This post threatens violence against an individual or a group of people",
                "This post glorifies violence",
                "This post threatens or promotes terrorism or violent extremism",
            ];
            await ModClub.getModClubActor(environment).addRules(rules, null);
            modClubRulesAdded := true;
        };
        await ModClub.getModClubActor(environment).updateSettings({minVotes = 2; minStaked = 15});
        await ModClub.getModClubActor(environment).subscribe({callback = modClubCallback;});
    };


    public shared({caller}) func exampleToInitiatePOH(): async ({#notAttempted; #pending; #rejected; #expired; #verified;#notSubmitted;}, ?Text) {
        // userId to check if it's a human or not
        let userId = Principal.fromText("2vxsx-fae");
        // call to check humanity
        let response =  await ModClub.getModClubActor(environment).pohVerificationRequest(userId);

        // If it's not a verified account then generate token to be used in iframe
        if(response.status != #verified) {
            return (response.status, ?(await ModClub.getModClubActor(environment).pohGenerateUniqueToken(userId)).token);
        };
        return (response.status, null);
    };
   
};