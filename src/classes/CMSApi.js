import axios from "axios";

class EscapeRoomContent {
  constructor(rawContent) {
    this.rawContent = rawContent;
    this.title = rawContent.title.rendered;
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

  get featuredImage() {
    return this._featuredImage;
  }

  set featuredImage(featuredImage) {
    this._featuredImage = featuredImage;
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

export default class CMSApi {
  static base = `${process.env.REACT_APP_CMS_API_BASE}/wp-json/wp/v2`;

  static findRoom = slug => {
    return axios
      .get(`${this.base}/rooms/?slug=${slug}&per_page=1&_embed`)
      .then(res => {
        if (res.data && res.data.length === 1) {
          return new EscapeRoomContent(res.data[0]);
        }
        throw new Error(`Escape room with slug ${slug} not found.`);
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
  };
}
