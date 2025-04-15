// Core
import app from "../src/app";

// Libraries
import request from "supertest";

describe("GET /", () => {
  it("should return status 200 and 'Server is running!'", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Server is running!");
  });
});
