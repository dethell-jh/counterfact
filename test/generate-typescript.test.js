import { generateTypeScript } from "../src/generate-typescript.js";

import { withTemporaryFiles } from "./lib/with-temporary-files.js";

function unindent([inputString]) {
  const middleLines = `\n${inputString.split("\n").slice(1, -1).join("\n")}\n`;

  const indent = middleLines
    .match(/\n\s+/gu)
    .reduce((currentLine, nextLine) =>
      currentLine.length <= nextLine.length ? currentLine : nextLine
    );

  return middleLines.replaceAll(indent, "\n").slice(1);
}

describe("typescript generator", () => {
  it("creates TypeScript from an openapi.yaml file", async () => {
    const files = {
      "openapi.yaml": `
        openapi: 3.0.0 
        info:
          title: Integration test example
          description: Example for integration test
          version: 0.0.1 
        paths:
          /hello: 
            get:
              parameters: 
              - in: query
                name: filter
                required: true
                schema:
                  type: string
                description: a query string parameter
              - in: query
                name: compact
                required: false
                schema:
                  type: boolean
                description: an optional query string parameter
              responses:
                200:
                  description: 200 for GET
                  content:
                    "*/*":
                      schema: 
                        type: string
                default:
                  description: default for GET
                  content:
                    "*/*":
                      schema: 
                        type: string
                    "application/json":
                      schema: 
                        type: number
            post:
              responses:
                default:
                    description: Hello world
                    content:
                      "*/*":
                        schema:  
                          type: number
          hello/{name}:
            get:
              parameters:
              - in: path
                name: name
                required: true
                schema:
                  type: string
                description: a path parameter
              responses:
                default:
                    content:  
                      "*/*":  
                        schema:  
                          type: string
          complex-types:
            get:
              parameters:
              - in: path
                name: name
                required: true
                schema:
                  type: string
                description: a path parameter
              responses:
                default:
                    content:  
                      "*/*":  
                        schema:  
                          type: object
                          properties:
                            name: 
                              type: string
                            age: 
                              type: number          
        `,
    };

    await withTemporaryFiles(files, async (temporaryDirectory, { read }) => {
      await generateTypeScript(
        `${temporaryDirectory}/openapi.yaml`,
        `${temporaryDirectory}paths`
      );

      await expect(read("paths/hello.types.ts")).resolves.toBe(unindent`  
        export type HTTP_GET = ({ query } : { query: { filter: string, compact?: boolean } }) => { status: 200, body: string } | { body: string } | { contentType: "application/json", body: number };
        export type HTTP_POST = () => { body: number };
      `);

      await expect(read("paths/hello/{name}.types.ts")).resolves.toBe(unindent`
        export type HTTP_GET = ({ path } : { path: { name: string } }) => { body: string };
      `);

      await expect(read("paths/complex-types.types.ts")).resolves.toBe(unindent`
        export type HTTP_GET = ({ path } : { path: { name: string } }) => { body: { name: string, age: number } };
      `);
    });
  });
});