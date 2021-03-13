const axios = require("axios");
const https = require("https");

const base = `https://jwer.brotherapp.org/wp-json/wp/v2`;

const agent = new https.Agent({
  rejectUnauthorized: false
});

class EscapeRoom {
  constructor(rawContent) {
    this.rawContent = rawContent;
    this.title = rawContent.title.rendered;
    this.id = rawContent.id;
    this.challenges = [];
    this.featuredImage =
      rawContent._embedded["wp:featuredmedia"].length > 0
        ? rawContent._embedded["wp:featuredmedia"][0]
        : null;
    // OPTIMIZE: add object with image sizes and corresponding links
  }

  get title() {
    return this._title;
  }

  set title(title) {
    this._title = title;
  }

  get id() {
    return this._id;
  }

  set id(id) {
    this._id = id;
  }

  get slug() {
    return this.rawContent.slug;
  }

  set slug(slug) {
    this.rawContent.slug = slug;
  }

  get wpStatus() {
    return this.rawContent.status;
  }

  set wpStatus(status) {
    this.rawContent.status = status;
  }

  get intro() {
    return this.rawContent.content.rendered;
  }

  set intro(intro) {
    this.rawContent.content.rendered = intro;
  }

  get excerpt() {
    return this.rawContent.excerpt.rendered;
  }

  set excerpt(excerpt) {
    this.rawContent.excerpt.rendered = excerpt;
  }

  get status() {
    return this.rawContent.acf.room_status;
  }

  set status(status) {
    this.rawContent.acf.room_status = room_status;
  }

  get challenges() {
    return this._challenges;
  }

  set challenges(challenges) {
    this._challenges = challenges;
  }

  get challengeMap() {
    return this.rawContent.acf.challenges;
  }

  set challengeMap(challenges) {
    this.rawContent.acf.challenges = challenges;
  }

  get outro() {
    return this.rawContent.acf.outro.content;
  }

  set outro(outro) {
    this.rawContent.acf.outro.content = outro;
  }

  get outroImage() {
    return this.rawContent.acf.outro.background;
  }

  set outroImage(outroImage) {
    this.rawContent.acf.outro.background = outroImage;
  }

  get duration() {
    return this.rawContent.acf.duration;
  }

  set duration(outroImage) {
    this.rawContent.acf.duration = outroImage;
  }

  get featuredImage() {
    return this._featuredImage;
  }

  set featuredImage(featuredImage) {
    this._featuredImage = featuredImage;
  }

  get videoBackground() {
    return this.rawContent.acf.video_background;
  }

  set videoBackground(videoBackground) {
    this.rawContent.acf.video_background = videoBackground;
  }

  async getChallenges() {
    const endpoint = new URL(`${base}/challenges/`);
    endpoint.searchParams.append(
      "_fields",
      "id,status,acf,content.rendered,title"
    );
    endpoint.searchParams.append("include", this.challengeMap.join(","));
    const res = await axios.get(endpoint.href, { httpsAgent: agent });
    if (!res.data || !res.data.length) return;
    this.challenges = res.data;
  }

  coverImage(size) {
    const obj = this._featuredImage["media_details"]["sizes"];
    switch (size) {
      case "medium":
        return obj.medium.source_url;
      case "thumbnail":
        return obj.thumbnail.source_url;
      case "full":
        return obj.full.source_url;
      default:
        return obj.full.source_url;
    }
  }
}

class CMSApi {
  static getAllRooms = async () => {
    const rooms = [];
    const endpoint = new URL(`${base}/rooms/`);
    endpoint.searchParams.append("_embed", "true");
    let res = null;
    try {
      res = await axios.get(endpoint.href, { httpsAgent: agent });
    } catch (e) {
      console.error(e.message);
    }
    if (res.data && res.data.length) {
      res.data.forEach(room => rooms.push(new EscapeRoom(room)));
    }
    return rooms;
  };

  static findRoom = (slug, fields = []) => {
    const endpoint = new URL(`${base}/rooms/`);
    endpoint.searchParams.append("slug", slug);
    endpoint.searchParams.append("per_page", 1);
    endpoint.searchParams.append("_embed", "true");
    return axios
      .get(endpoint.href, { httpsAgent: agent })
      .then(res => {
        if (res.data && res.data.length === 1) {
          return new EscapeRoom(res.data[0]);
        }
        throw new Error(`Escape room with slug ${slug} not found.`);
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
  };

  static getRoom = (slug, fields) => {
    const endpoint = new URL(`${base}/rooms/`);
    endpoint.searchParams.append("slug", slug);
    endpoint.searchParams.append("per_page", 1);
    endpoint.searchParams.append("_embed", "true");
    if (fields.length) {
      endpoint.searchParams.append("_fields", fields.join(","));
    }
    return axios
      .get(endpoint.href, { httpsAgent: agent })
      .then(res => {
        if (res.data && res.data.length === 1) {
          return res.data[0];
        }
        throw new Error(`Escape room with slug ${slug} not found.`);
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
  };
}

module.exports = CMSApi;
