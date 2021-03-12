import { expect } from "chai";

import NamePicker from "../../classes/NamePicker";
import teamNames from "../../data/teamNames.json";

describe("classes/NamePicker", () => {
  it("should get name and remove from list", () => {
    const TeamNames = new NamePicker();
    const name = TeamNames.getRandom();
    expect(name).to.not.eql("");
    expect(TeamNames.getRemainingNames()).to.have.lengthOf(
      teamNames.primary.length + teamNames.secondary.length - 1
    );
  });

  it("should prefix names with given word", () => {
    const TeamNames = new NamePicker({ prefix: "The" });
    const name = TeamNames.getRandom();
    expect(name).to.not.eql("");
    expect([name[0], name[1], name[2]]).to.eql(["T", "h", "e"]);
    expect(TeamNames.getRemainingNames()).not.include.members([name]);
    expect(TeamNames.getRemainingNames()).to.have.lengthOf(
      teamNames.primary.length + teamNames.secondary.length - 1
    );
  });

  it("should use up primary names before second", () => {
    const TeamNames = new NamePicker();
    // call get random and use up all primary names
    teamNames.primary.forEach(n => TeamNames.getRandom());
    // make sure that the next name is not in primary but in secondary
    const nextName = TeamNames.getRandom();
    expect(teamNames.primary).to.not.include.members([nextName.trim()]);
    expect(teamNames.secondary).to.include.members([nextName.trim()]);
    const nextName2 = TeamNames.getRandom();
    expect(teamNames.primary).to.not.include.members([nextName2.trim()]);
    expect(teamNames.secondary).to.include.members([nextName2.trim()]);
  });
});
