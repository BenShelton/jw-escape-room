import CMSApi from "./CMSApi";

it("finds correct room", async () => {
  let post = await CMSApi.findRoom("the-last-of-the-last-days");
  expect(post).toHaveProperty("title");
});

it("uses fields", async () => {
  let post = await CMSApi.getRoom("the-last-of-the-last-days", ["id"]);
  expect(post).not.toHaveProperty("slug");
  expect(post).toHaveProperty("id");
});
