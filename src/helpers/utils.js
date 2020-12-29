export const getSubdomain = (location, dev) => {
  // remove protocol
  location = location.replace(/^https?:\/\//, "");
  // remove www
  location = location.replace(/^www\./, "");
  const split = location.split(".");
  // expect 3 for production () and 2 for dev (escaperoute.localhost:3000)
  const triggerLength = dev === true ? 2 : 3;
  const subdomain = split.length === triggerLength ? split[0] : null;
  return subdomain;
};