test("GET to /api/v1/status should return 200", async () => {
  console.log('http://localhost:3000/api/v1/status')
  const response = await fetch('http://localhost:3000/api/v1/status');
  expect(response.status).toBe(200);
});
