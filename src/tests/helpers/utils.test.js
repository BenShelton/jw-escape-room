import { expect } from "chai";

import * as utils from "../../helpers/utils";

describe("Utils", () => {
  describe("utils/getSubdomain", () => {
    it("should get subdomain w/ protocol", () => {
      const subdomain = utils.getSubdomain("http://escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/o protocol", () => {
      const subdomain = utils.getSubdomain("escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www", () => {
      const subdomain = utils.getSubdomain("www.escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www and protocol", () => {
      const subdomain = utils.getSubdomain(
        "http://www.escaperoom.jwzoom.games/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www and protocol https", () => {
      const subdomain = utils.getSubdomain(
        "https://www.escaperoom.jwzoom.games/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should not subdomain and return null", () => {
      const subdomain = utils.getSubdomain("https://www.jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should not subdomain and return null", () => {
      const subdomain = utils.getSubdomain("https://jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should not subdomain and return null", () => {
      const subdomain = utils.getSubdomain("https://jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should get subdomain on localhost:3000", () => {
      const subdomain = utils.getSubdomain(
        "https://escaperoom.localhost:3000/",
        true
      );
      expect(subdomain).to.equal("escaperoom");
    });
  });
});
