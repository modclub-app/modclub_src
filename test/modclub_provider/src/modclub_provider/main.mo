import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Files "./files";
import Iter "mo:base/Iter";
import ModClub "./modclub/modclub";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Error "mo:base/Error";

shared ({ caller = initializer }) actor class ModclubProvider() = this {
  type SubscribeMessage = ModClub.SubscribeMessage;
  type ContentResult = ModClub.ContentResult;
  let MC = ModClub.ModClub;
  let file = Files.File();
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public func onlyOwner(p : Principal) : async () {
    if (p != initializer) throw Error.reject("unauthorized");
  };

  public shared ({ caller }) func test() : async Text {
    // await onlyOwner(caller);
    // Register with Modclub

    let registerResult = await MC.registerProvider(
      "SocialApp-1",
      "The description of your application-1.",
      null,
    );

    // Sub the callback
    await subscribe();

    // Add content rules
    await MC.addRules(
      [
        "No violent content",
        "No drugs",
        "This post contains intimate photos or videos of someone that were produced or distributed without their permission",
        "This post contains other peoples private information (such as home phone number and address) without their express written permission",
        "This post is excessively gory",
        "This post threatens or promotes terrorism or violent extremitism",
      ],
      null,
    );

    // Update settings
    await MC.updateSettings(
      Principal.fromActor(this),
      { minVotes = 2; minStaked = 15 },
    );

    // Submit content to be reviewed by moderators
    let test1 = await MC.submitText(
      "id_1",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.",
      ?"Test 111 Title",
    );
    let test2 = await MC.submitText(
      "id_2",
      "Duis dui massa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, eu malesuada risus aliquet ac. Aliquam tortor nunc, fermentum ac lacus a, interdum venenatis risus. Etiam congue tempor viverra. Quisque congue semper porta. Nullam vel scelerisque diam. Fusce tincidunt est nec vehicula vulputate. Aliquam volutpat turpis justo, ac pharetra neque pharetra vitae. Nullam placerat ornare nulla, id lobortis lectus malesuada sit amet. Nullam lobortis ipsum ac suscipit dignissim. Duis in sem imperdiet, pellentesque felis in, auctor mi. Vivamus blandit nunc vel urna semper scelerisque. Fusce rhoncus suscipit arcu, ut convallis metus pretium sed. Sed finibus nisi vitae fermentum sodales.",
      ?"Lassa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, e",
    );
    let test3 = await MC.submitText(
      "id_3",
      "Donec in tempor mauris. Curabitur luctus purus quis nulla eleifend sagittis. Mauris eu elit vel metus placerat tincidunt eu id enim. Integer tincidunt lorem lorem, quis sodales augue accumsan ut. Donec tristique est felis, ut finibus velit fermentum vitae. Vestibulum quis ultricies justo. Mauris non erat at sem cursus fringilla nec fringilla lectus. In porta sagittis sapien nec ullamcorper. Suspendisse at lectus a enim dignissim euismod at vel elit. Sed eget volutpat metus. Curabitur mattis tellus eget turpis eleifend, commodo congue massa convallis. Nullam pretium sed nulla at faucibus. Suspendisse consectetur risus ipsum, eget hendrerit purus suscipit sed. Curabitur egestas ligula sed iaculis dapibus. Suspendisse fringilla erat ac sem finibus, et lacinia tellus aliquam. Praesent sit amet varius leo, ac blandit felis.",
      ?"Lesuada sit amet.",
    );

    let test4 = await MC.submitImage(
      "id_4",
      file.SoccerBall,
      "image/jpeg",
      ?"Soccer Ball",
    );

    let test5 = await MC.submitHtmlContent(
      "id_5",
      "<h1>Didn't melt fairer keepsakes since Fellowship elsewhere.</h1><p>Woodlands payment Osgiliath tightening. Barad-dur follow belly comforts tender tough bell? Many that live deserve death. Some that die deserve life. Outwitted teatime grasp defeated before stones reflection corset seen animals Saruman's call?</p><h2>Tad survive ensnare joy mistake courtesy Bagshot Row.</h2><p>Ligulas step drops both? You shall not pass! Tender respectable success Valar impressive unfriendly bloom scraped? Branch hey-diddle-diddle pony trouble'll sleeping during jump Narsil.</p><h3>North valor overflowing sort Iáve mister kingly money?</h3><p>Curse you and all the halflings! Deserted anytime Lake-town burned caves balls. Smoked lthilien forbids Thrain?</p><ul> <li>Adamant.</li> <li>Southfarthing!</li> <li>Witch-king.</li> <li>Precious.</li> <li>Gaffer's!</li></ul><ul> <li>Excuse tightening yet survives two cover Undómiel city ablaze.</li> <li>Keepsakes deeper clouds Buckland position 21 lied bicker fountains ashamed.</li> <li>Women rippling cold steps rules Thengel finer.</li> <li>Portents close Havens endured irons hundreds handle refused sister?</li> <li>Harbor Grubbs fellas riddles afar!</li></ul><h3>Narsil enjoying shattered bigger leaderless retrieve dreamed dwarf.</h3><p>Ravens wonder wanted runs me crawl gaining lots faster! Khazad-dum surprise baby season ranks. I bid you all a very fond farewell.</p><ol> <li>Narsil.</li> <li>Elros.</li> <li>Arwen Evenstar.</li> <li>Maggot's?</li> <li>Bagginses?</li></ol><ol> <li>Concerning Hobbits l golf air fifth bell prolonging camp.</li> <li>Grond humble rods nearest mangler.</li> <li>Enormity Lórien merry gravy stayed move.</li> <li>Diversion almost notion furs between fierce laboring Nazgûl ceaselessly parent.</li> <li>Agree ruling um wasteland Bagshot Row expect sleep.</li></ol><h3>Ere answering track forests shards roof!</h3><p>Delay freezes Gollum. Let the Ring-bearer decide. Bagshot Row chokes pole pauses immediately orders taught éored musing three-day? Disease rune repel source fire Goblinses already?</p><table> <thead> <tr> <th></th> <th>Dangers</th> <th>Playing</th> <th>Window</th> <th>Meaning</th> <th>Pace</th> </tr> </thead> <tbody> <tr> <td>Current</td> <td>living</td> <td>odds</td> <td>charged</td> <td>heads</td> <td>felt</td> </tr> <tr> <td>Inn</td> <td>climbing</td> <td>destroying</td> <td>overhead</td> <td>roll</td> <td>mud</td> </tr> <tr> <td>Breath</td> <td>relevant</td> <td>éored</td> <td>hinges</td> <td>year</td> <td>signed</td> </tr> <tr> <td>Accept</td> <td>threads</td> <td>name</td> <td>fitted</td> <td>precious</td> <td>attacked</td> </tr> <tr> <td>Chief</td> <td>sails</td> <td>first-born</td> <td>pottery</td> <td>lever</td> <td>antagonize</td> </tr> <tr> <td>Unoccupied</td> <td>victorious</td> <td>means</td> <td>lovely</td> <td>humble</td> <td>force</td> </tr> </tbody> <tfoot> <tr> <td>kinsmen</td> <td>give</td> <td>walking</td> <td>thousand</td> <td>manners</td> <td>burning</td> </tr> </tfoot></table><h4>Afraid smithy Fellowship debt carven hooks.</h4><p>What about second breakfast? Nags runt near Lindir lock discover level? Andûril breathe waited flatten union.</p><blockquote> <p>You shall be the Fellowship of the Ring.</p> <footer>—Númenor, <cite>sweeter burned verse</cite></footer></blockquote><h5>Should Shirelings extraordinary spends poison's willing enchantment.</h5><p>I think we should get off the road. Penalty sight splintered Misty Mountain mithril? Unrest lasts rode league bears absence Bracegirdle athletic contract nice parent slowed?</p><pre>Pardon Concerning Hobbits rune goblins? Twitching figure including rightful Thorin's level! Worth tubers threats Hornburg deadliest? Unfold thumping shh wants Homely!</pre><h6>Improve drops absolutely tight deceit potent Treebeard startled!</h6><p>J.R.R. Tolkien 3000 uttered veins <q>roaring winds moaning flaming</q>. Meddle <ins>measure pure</ins> Samwise Gamgee business! <sub>Lied</sub> mistake Proudfoots pon. Instance 80 <dfn>morbid ceremonial plunge</dfn> Anor mad. Questions shells hangs noble Proudfoots <var>throws</var>. <mark>Rampart damage</mark> questions Chubbs 3000 conjurer? Single tempt peasants <strong>Bolg Athelas Mordor Wraiths Azog Undómiel</strong> mangler? <samp>Nori Giants Undómiel Rivendell</samp> spike posts took. Fool's Underhill boarded <cite>vanishing twilight unheard-of</cite>. <abbr>Presence</abbr> Dunland lamb lair. Barricade <sup>didn't</sup> feelings purring vine Morgoth. Distract Giants nearing champion <kbd>T</kbd>. Clothing titles quick bother <em>Arod Gloin Beren</em> troop? Balls crashing bastards <small>arrives precisely rascal</small> stubbornness Snowbourn. Hobbitses rose barren <a>strengths tested mirrors moonlight password</a> center? Remade <x-code>free filthy</x-code> breaking respect amuse Arod? Vengeance <del>Elessar Wolves</del> posts remain doorway said! <time>Suspects</time> fight Merry hungers locked yelp.</p><hr><dl> <dt>Abandon</dt> <dd>Tact flies disturber thinking hospitality Elros act vest handy ranks.</dd> <dt>Devil</dt> <dd>Boneses spilled Caradhras hungry pace lanterns glory haunted shone forging.</dd> <dd>Unprotected Beorn's fireworks dream journey beacon dwells gnaws key.</dd> <dt>Happened</dt> <dd>Known wanna fifth Bill hell knew she scale.</dd> <dd>Missing vanish taken colleague sway voice tricks 13 Grimbold.</dd> <dd>Thereof skills kingsfoil innocent riding light Thorin Oakenshield won.</dd></dl><form> <fieldset> <legend>Blind kitchen</legend> <div> <label>Text</label> <input type='text'> </div> <div> <label>Email</label> <input type='email'> </div> <div> <label>Password</label> <input type='password'> </div> <div> <label>Url</label> <input type='url'> </div> <div> <label>Number</label> <input type='number'> </div> <div> <label>Tel</label> <input type='tel'> </div> <div> <label>Search</label> <input type='search'> </div> <div> <label>Time</label> <input type='time'> </div> <div> <label>Date</label> <input type='date'> </div> <div> <label>Datetime-local</label> <input type='datetime-local'> </div> <div> <label>Week</label> <input type='week'> </div> <div> <label>Textarea</label> <textarea></textarea> </div> </fieldset> <fieldset> <legend>Chasm mountains mountainside</legend> <div> <label>Month</label> <input type='month'> </div> <div> <label><input type='checkbox' name='checkbox'>sharp decided</label> </div> <div> <label>Color</label> <input type='color'> </div> <div> <label>File</label> <input type='file'> </div> <div> <label>Hidden</label> <input type='hidden'> </div> <div> <label>Image</label> <input type='image'> </div> <div> <label>bags moment's darkest hastens highest spot</label> <label><input type='radio' name='radio'>sakes is</label> <label><input type='radio' name='radio'>tomb vines</label> <label><input type='radio' name='radio'>tricksy plain</label> </div> <div> <label>Range</label> <input type='range'> </div> <div> <input type='button' value='Button'> </div> <div> <input type='reset' value='Reset'> </div> <div> <input type='submit' value='Submit'> </div> <button>works tilled entered</button> <div> <label>Select</label> <select> <optgroup label='dragon'> <option>ending</option> <option>always</option> <option>spears</option> </optgroup> <optgroup label='suffer night'> <option>diamond</option> <option>unprotected</option> <option>consider</option> </optgroup> </select> </div> </fieldset></form>",
      ?"Taylors HTML2",
    );

    await MC.addProviderAdmin(

      Principal.fromText("YOUR_STOIC_PRINCIPAL_ID"),
      "moderator",
      null,
    );

    return registerResult # "\n " # test1 # "\n" # test2 # "\n" # test3;
  };

  public shared ({ caller }) func addAdmin(p : Principal) : async () {
    await MC.addProviderAdmin(p, "moderator", null);
  };

  public shared ({ caller }) func submitText(
    id : Text,
    text : Text,
    title : ?Text,
  ) : async Text {
    let res = await MC.submitText(id, text, title);
    res;
  };

  public shared ({ caller }) func submitImage(
    id : Text,
    data : [Nat8],
    imageType : Text,
    title : Text,
  ) : async Text {
    await MC.submitImage(id, data, imageType, ?title);
  };

  public func register(name : Text, details : Text) : async () {
    let registerResult = await MC.registerProvider(name, details, null);
  };

  public func updateSettings(voteNum : Nat, stakeNum : Nat) : async () {
    await MC.updateSettings(
      initializer,
      { minVotes = voteNum; minStaked = stakeNum },
    );
  };

  public func subscribe() : async () {
    await MC.subscribe({ callback = voteResult });
  };

  public func deregister() : async Text {
    await MC.deregisterProvider();
  };

  public func voteResult(result : ContentResult) {
    Debug.print(debug_show (result));
  };

  public func testDataCanisterStorage() : async (Principal, Principal, Text) {
    let text1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.";
    let text2 = "Duis dui massa, imperdiet vitae volutpat ac, interdum non leo. Curabitur non ipsum dui. Nam dictum erat felis, eu malesuada risus aliquet ac. Aliquam tortor nunc, fermentum ac lacus a, interdum venenatis risus. Etiam congue tempor viverra. Quisque congue semper porta. Nullam vel scelerisque diam. Fusce tincidunt est nec vehicula vulputate. Aliquam volutpat turpis justo, ac pharetra neque pharetra vitae. Nullam placerat ornare nulla, id lobortis lectus malesuada sit amet. Nullam lobortis ipsum ac suscipit dignissim. Duis in sem imperdiet, pellentesque felis in, auctor mi. Vivamus blandit nunc vel urna semper scelerisque. Fusce rhoncus suscipit arcu, ut convallis metus pretium sed. Sed finibus nisi vitae fermentum sodales.";
    let text3 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum velit sed nibh porttitor efficitur. Maecenas id efficitur risus, et vehicula nisl. Donec pretium eget purus elementum porttitor. Vivamus malesuada, nisi in mollis luctus, massa odio pharetra metus, sed rutrum mi nisl quis justo. Quisque mattis, purus id dapibus sodales, nisl purus aliquam elit, sed lobortis ex augue a eros. Sed dolor justo, ornare auctor fringilla at, sodales non turpis. Aliquam iaculis, erat vel molestie luctus, mauris sapien efficitur nibh, at facilisis nulla ex nec ante. Vestibulum et lorem ac ante accumsan lobortis.";

    //Text Dumping
    let test1 = await MC.putBlobsInDataCanister(
      "id_1",
      Text.encodeUtf8(text1),
      1,
      3,
      "text/plain",
    );
    let test2 = await MC.putBlobsInDataCanister(
      "id_1",
      Text.encodeUtf8(text2),
      2,
      3,
      "text/plain",
    );
    let test3 = await MC.putBlobsInDataCanister(
      "id_1",
      Text.encodeUtf8(text3),
      3,
      3,
      "text/plain",
    );

    let actualText1 = await MC.getBlob("id_1", test1.0, 1);
    let actualText2 = await MC.getBlob("id_1", test1.0, 2);
    let actualText3 = await MC.getBlob("id_1", test1.0, 3);

    //Image Dumping
    let test4 = await MC.putBlobsInDataCanister(
      "id_4",
      Blob.fromArray(file.SoccerBall),
      1,
      1,
      "image/jpeg",
    );

    var len = file.SoccerBall.size();
    var partitionSize = len / 3;

    var startIndex = 0;
    var imagePrincipal = "";
    for (i in Iter.range(1, 3)) {
      let arr : [Nat8] = Array.tabulate<Nat8>(
        partitionSize,
        func gen(ind : Nat) : Nat8 {
          let val = file.SoccerBall[startIndex];
          startIndex := startIndex +1;
          val;
        },
      );
      let test5 = await MC.putBlobsInDataCanister(
        "id_6",
        Blob.fromArray(arr),
        i,
        3,
        "image/jpeg",
      );
      imagePrincipal := Principal.toText(test5.0);
    };
    (test1.0, test4.0, imagePrincipal);
  };

  public func addRule(rule : Text) : async () {
    await MC.addRules([rule], null);
  };
};
