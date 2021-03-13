import { expect } from "chai";

import * as utils from "../../helpers/utils";

describe("Utils", () => {
  describe("utils/getSubdomain", () => {
    afterEach(() => (process.env.REACT_APP_FB_ENV = null));
    it("should get subdomain w/ protocol", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("http://escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/o protocol", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("www.escaperoom.jwzoom.games/");
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www and protocol", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain(
        "http://www.escaperoom.jwzoom.games/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain w/ www and protocol https", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain(
        "https://www.escaperoom.jwzoom.games/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should not subdomain and return null", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("https://www.jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should not subdomain and return null", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("https://jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should not subdomain and return null", () => {
      process.env.REACT_APP_FB_ENV = "production";
      const subdomain = utils.getSubdomain("https://jwzoom.games/");
      expect(subdomain).to.equal(null);
    });

    it("should not get subdomain and return null in localhost:3000", () => {
      process.env.REACT_APP_FB_ENV = "development";
      const subdomain = utils.getSubdomain("localhost:3000");
      expect(subdomain).to.equal(null);
    });

    it("should get subdomain on localhost:3000", () => {
      process.env.REACT_APP_FB_ENV = "development";
      const subdomain = utils.getSubdomain(
        "https://escaperoom.localhost:3000/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain in staging environment", () => {
      process.env.REACT_APP_FB_ENV = "staging";
      const subdomain = utils.getSubdomain(
        "https://escaperoom.jw-escape-rooms-staging.web.app/"
      );
      expect(subdomain).to.equal("escaperoom");
    });

    it("should get subdomain in staging environment", () => {
      process.env.REACT_APP_FB_ENV = "staging";
      const subdomain = utils.getSubdomain(
        "https://escaperoom.staging.jwzoom.games"
      );
      expect(subdomain).to.equal("escaperoom");
    });
  });

  describe("utils/isVideo", () => {
    it("should be true for mp4", () => {
      const result = utils.isVideo(
        "https://jwer.brotherapp.org/wp-content/uploads/2020/12/Storm-16160.mp4"
      );
      expect(result).to.be.true;
    });
    it("should not true for mp4", () => {
      const result = utils.isVideo(
        "https://jwer.brotherapp.org/wp-content/uploads/2020/12/Storm-16160.jpeg"
      );
      expect(result).to.be.false;
    });
  });

  describe("utils/isCorrectAnswer", () => {
    it("should match regex from string", () => {
      const result = utils.isCorrectAnswer(
        "(THE)?s?DISTRICTs?OF(THE)?s?JORDAN",
        "DISTRICTOFTHEJORDAN"
      );
      expect(result).to.eql(true);
    });
    it("should match regex from string and be case insensitive", () => {
      const regexPattern = "(THE)?\\s?DISTRICT\\s?OF\\s?(THE)?\\s?JORDAN";
      const result = utils.isCorrectAnswer(
        // prettier-ignore
        regexPattern,
        "district of the Jordan"
      );
      expect(result).to.eql(true);
    });
    it("should match regex from string and remove double spaces", () => {
      const regexPattern = "(THE)?\\s?DISTRICT\\s?OF\\s?(THE)?\\s?JORDAN";
      const result = utils.isCorrectAnswer(
        // prettier-ignore
        regexPattern,
        "district of the   Jordan "
      );
      expect(result).to.eql(true);
    });
  });
});
