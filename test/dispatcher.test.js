import { Dispatcher } from "../src/dispatcher.js";
import { Registry } from "../src/registry.js";

describe("a dispatcher", () => {
  it("dispatches a get request to a server and returns the response", async () => {
    const registry = new Registry();

    registry.add("/hello", {
      GET() {
        return {
          body: "hello",
        };
      },
    });

    const dispatcher = new Dispatcher(registry);
    const response = await dispatcher.request({
      method: "GET",
      path: "/hello",
      body: "",
    });

    expect(response.body).toBe("hello");
  });

  it("passes the request body", async () => {
    const registry = new Registry();

    registry.add("/a", {
      GET({ body }) {
        return {
          body: `Hello ${body.name} of ${body.place}!`,
        };
      },
    });

    const dispatcher = new Dispatcher(registry);
    const response = await dispatcher.request({
      method: "GET",
      path: "/a",

      body: {
        name: "Catherine",
        place: "Aragon",
      },
    });

    expect(response.body).toBe("Hello Catherine of Aragon!");
  });

  it("passes the request headers", async () => {
    const registry = new Registry();
    const mockedJWT = "test token";

    registry.add("/a", {
      GET({ headers }) {
        return {
          headers,
        };
      },
    });

    const dispatcher = new Dispatcher(registry);

    const authHeader = {
      Authorization: `Bearer: ${mockedJWT}`,
      "Cache-Control": "max-age=0",
    };

    const response = await dispatcher.request({
      method: "GET",
      path: "/a",

      headers: authHeader,
    });

    expect(response.headers).toBe(authHeader);
  });

  it("passes the query params", async () => {
    const registry = new Registry();

    registry.add("/a", {
      GET({ query }) {
        return {
          body: `Searching for stores near ${query.zip}!`,
        };
      },
    });

    const dispatcher = new Dispatcher(registry);
    const response = await dispatcher.request({
      method: "GET",
      path: "/a",

      query: {
        zip: "90210",
      },
    });

    expect(response.body).toBe("Searching for stores near 90210!");
  });

  it("passes a tools object", async () => {
    const registry = new Registry();

    registry.add("/a", {
      GET({ tools }) {
        return { body: tools.accepts("text/html") };
      },
    });

    const dispatcher = new Dispatcher(registry);
    const htmlResponse = await dispatcher.request({
      method: "GET",
      path: "/a",

      headers: {
        Accept: "text/html",
      },
    });

    expect(htmlResponse.body).toBe(true);

    const textResponse = await dispatcher.request({
      method: "GET",
      path: "/a",

      headers: {
        Accept: "text/plain",
      },
    });

    expect(textResponse.body).toBe(false);
  });

  it("passes status code in the response", async () => {
    const registry = new Registry();

    registry.add("/stuff", {
      PUT() {
        return {
          status: 201,
          body: "ok",
        };
      },
    });

    const dispatcher = new Dispatcher(registry);
    const response = await dispatcher.request({
      method: "PUT",
      path: "/stuff",
    });

    expect(response.status).toBe(201);
  });

  it("allows the context object to be mutated directly", async () => {
    const registry = new Registry({ value: 0 });

    registry.add("/increment/{value}", {
      GET({ context, path }) {
        const amountToIncrement = Number.parseInt(path.value, 10);

        context.value += amountToIncrement;

        return { body: "incremented" };
      },
    });

    const dispatcher = new Dispatcher(registry);

    const result = await dispatcher.request({
      method: "GET",
      path: "/increment/1",
      body: "",
    });

    expect(result.body).toBe("incremented");

    expect(registry.context.value).toBe(1);

    await dispatcher.request({
      method: "GET",
      path: "/increment/2",
      body: "",
    });

    expect(registry.context.value).toBe(3);
  });
});

describe("given a in invalid path", () => {
  it("returns a 404 when the route is not found", () => {
    const registry = new Registry();

    registry.add("/your/{side}/{bodyPart}/in/and/your/left/foot/out", {
      PUT() {
        return {
          status: 201,
          body: "ok",
        };
      },
    });

    const response = new Dispatcher(registry).request({
      method: "PUT",
      path: "/your/left/foot/in/and/your/right/foot/out",
    });

    expect(response.status).toBe(404);

    expect(response.body).toBe(
      "Could not find a PUT method at " +
        "/your/left/foot/in/and/your/right/foot/out\n" +
        "Got as far as /your/{side}/{bodyPart}/in/and/your"
    );
  });
});
