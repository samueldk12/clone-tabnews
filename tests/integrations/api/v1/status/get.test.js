test("GET to /api/v1/status should return 200", async () => {
  console.log(process.env.URL_SITE.concat('api/v1/status'))
  const response = await fetch(process.env.URL_SITE.concat('api/v1/status'));
  expect(response.status).toBe(200);
});
