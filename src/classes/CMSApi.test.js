import CMSApi from "./CMSApi";

it("finds correct room", async () => {
  let post = await CMSApi.findRoom("the-last-of-the-last-days");
  expect(post).toHaveProperty("slug", "the-last-of-the-last-days");
});
