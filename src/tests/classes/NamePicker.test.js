import { expect } from "chai";

import NamePicker from "../../classes/NamePicker";
import teamNames from "../../data/teamNames.json";

describe("classes/NamePicker", () => {
  it("should get name and remove from list", () => {
    const TeamNames = new NamePicker();
    const name = TeamNames.getRandom();
    expect(name).to.not.eql("");
    expect(TeamNames.getRemainingNames()).to.have.lengthOf(
      teamNames.length - 1
    );
  });
  it("should get name and remove from list", () => {
    const TeamNames = new NamePicker({ prefix: "The" });
    const name = TeamNames.getRandom();
    expect(name).to.not.eql("");
    expect([name[0], name[1], name[2]]).to.eql(["T", "h", "e"]);
    expect(TeamNames.getRemainingNames()).not.include.members([name]);
    expect(TeamNames.getRemainingNames()).to.have.lengthOf(
      teamNames.length - 1
    );
  });
});
