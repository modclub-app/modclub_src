import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";

module {
    public func generateUUID() : async Text {
        let g = Source.Source();
        let uuid = await g.new();
        return UUID.toText(await g.new());
    };
}