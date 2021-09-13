import Debug "mo:base/Debug";
import Text "mo:base/Text";
import ModClub "./modclub/modclub";


actor {
    type SubscribeMessage = ModClub.SubscribeMessage;
    type ContentResult = ModClub.ContentResult;
    let MC = ModClub.ModClub;
    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public func test() : async Text {
        // Register with Modclub
        let registerResult = await MC.registerProvider("TestApp");

        // Sub the callback
        await subscribe();

        // Add content rules
        await MC.addContentRules(["No violent content", "No drugs"]);

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
};
