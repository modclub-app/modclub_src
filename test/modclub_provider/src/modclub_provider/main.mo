import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Files "./files";
import Iter "mo:base/Iter";
import ModClub "./modclub/modclub";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor {
    type SubscribeMessage = ModClub.SubscribeMessage;
    type ContentResult = ModClub.ContentResult;
    let MC = ModClub.ModClub;
    let file = Files.File();
    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public func test() : async Text {
        // Register with Modclub
        let registerResult = await MC.registerProvider("SocialApp", "The description of your application.", null);

        // Sub the callback
        await subscribe();

        // Add content rules
        await MC.addRules(["No violent content", "No drugs"]);

        // Update settings
        await MC.updateSettings({minVotes = 2; minStaked = 15});

        // Submit content to be reviewed by moderators
        let test1 = await MC.submitText("id_1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.", ?"Test 111 Title");
        let test2 = await MC.submitText("id_2", "Duis dui massa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, eu malesuada risus aliquet ac. Aliquam tortor nunc, fermentum ac lacus a, interdum venenatis risus. Etiam congue tempor viverra. Quisque congue semper porta. Nullam vel scelerisque diam. Fusce tincidunt est nec vehicula vulputate. Aliquam volutpat turpis justo, ac pharetra neque pharetra vitae. Nullam placerat ornare nulla, id lobortis lectus malesuada sit amet. Nullam lobortis ipsum ac suscipit dignissim. Duis in sem imperdiet, pellentesque felis in, auctor mi. Vivamus blandit nunc vel urna semper scelerisque. Fusce rhoncus suscipit arcu, ut convallis metus pretium sed. Sed finibus nisi vitae fermentum sodales.", ?"Lassa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, e");
        let test3 = await MC.submitText("id_3", "Donec in tempor mauris. Curabitur luctus purus quis nulla eleifend sagittis. Mauris eu elit vel metus placerat tincidunt eu id enim. Integer tincidunt lorem lorem, quis sodales augue accumsan ut. Donec tristique est felis, ut finibus velit fermentum vitae. Vestibulum quis ultricies justo. Mauris non erat at sem cursus fringilla nec fringilla lectus. In porta sagittis sapien nec ullamcorper. Suspendisse at lectus a enim dignissim euismod at vel elit. Sed eget volutpat metus. Curabitur mattis tellus eget turpis eleifend, commodo congue massa convallis. Nullam pretium sed nulla at faucibus. Suspendisse consectetur risus ipsum, eget hendrerit purus suscipit sed. Curabitur egestas ligula sed iaculis dapibus. Suspendisse fringilla erat ac sem finibus, et lacinia tellus aliquam. Praesent sit amet varius leo, ac blandit felis.", ?"Lesuada sit amet.");

        let test4 = await MC.submitImage("id_4", file.SoccerBall, "image/jpeg", ?"Soccer Ball" );

        return registerResult # "\n " # test1 # "\n" # test2 # "\n" # test3;
    };

    public func submitText(id: Text, text: Text, title: Text) : async Text  {
        let res = await MC.submitText(id, text, ?title);
        res;
    };

    public func submitImage(id: Text, data: [Nat8], imageType: Text, title: Text) : async Text {
        await MC.submitImage(id, data, imageType, ?title);
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

    public func testDataCanisterStorage() : async (Principal, Principal, Text) {
        let text1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.";
        let text2 = "Duis dui massa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, eu malesuada risus aliquet ac. Aliquam tortor nunc, fermentum ac lacus a, interdum venenatis risus. Etiam congue tempor viverra. Quisque congue semper porta. Nullam vel scelerisque diam. Fusce tincidunt est nec vehicula vulputate. Aliquam volutpat turpis justo, ac pharetra neque pharetra vitae. Nullam placerat ornare nulla, id lobortis lectus malesuada sit amet. Nullam lobortis ipsum ac suscipit dignissim. Duis in sem imperdiet, pellentesque felis in, auctor mi. Vivamus blandit nunc vel urna semper scelerisque. Fusce rhoncus suscipit arcu, ut convallis metus pretium sed. Sed finibus nisi vitae fermentum sodales.";
        let text3 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.";

        //Text Dumping
        let test1 = await MC.putBlobsInDataCanister("id_1", Text.encodeUtf8(text1), 1, 3, "text/plain");
        let test2 = await MC.putBlobsInDataCanister("id_1", Text.encodeUtf8(text2), 2, 3, "text/plain");
        let test3 = await MC.putBlobsInDataCanister("id_1", Text.encodeUtf8(text3), 3, 3, "text/plain");

        let actualText1 = await MC.getBlob("id_1", test1.0, 1);
        let actualText2 = await MC.getBlob("id_1", test1.0, 2);
        let actualText3 = await MC.getBlob("id_1", test1.0, 3);

        //Image Dumping
        let test4 = await MC.putBlobsInDataCanister("id_4", Blob.fromArray(file.SoccerBall), 1, 1, "image/jpeg");

        var len = 0;
        for(pixel in file.SoccerBall.vals()) {
            len:=len+1;
        };
        var partitionSize = len / 3;

        var startIndex = 0;
        var imagePrincipal = "";
        for(i in Iter.range(1, 3)) {
            let arr: [Nat8] = Array.tabulate<Nat8>(partitionSize, func gen(ind:Nat): Nat8 {
                let val = file.SoccerBall[startIndex];
                startIndex:=startIndex+1;
                val;
            });
            let test5 = await MC.putBlobsInDataCanister("id_6", Blob.fromArray(arr), i, 3, "image/jpeg");
            imagePrincipal:= Principal.toText(test5.0);
        };
        (test1.0, test4.0, imagePrincipal);
    }
};
