import { AllHtmlEntities as Entities } from "html-entities";
const entities = new Entities();

export const getSubdomain = (location, dev) => {
  // remove protocol
  location = location.replace(/^https?:\/\//, "");
  // remove www
  location = location.replace(/^www\./, "");
  const split = location.split(".");
  // expect 3 for production () and 2 for dev (escaperoute.localhost:3000)
  // const triggerLength = dev === true ? 2 : 3;
  let triggerLength = null;
  switch (process.env.REACT_APP_FB_ENV) {
    case "development":
      triggerLength = 2;
      break;
    case "staging":
      triggerLength = 4;
      break;
    case "production":
      triggerLength = 3;
      break;
    default:
      triggerLength = 3;
  }
  const subdomain = split.length === triggerLength ? split[0] : null;
  return subdomain;
};

export const isVideo = (fileName = "") =>
  ["mp4", "MOV", "mov"].includes(fileName.match(/[^\\]*\.(\w+)$/)[1]);

export const render = html => entities.decode(html);
