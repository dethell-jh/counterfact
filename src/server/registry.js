function castParameter(value, schema) {
  if (!schema) {
    return value;
  }

  if (schema.type === "integer" || schema.type === "number") {
    return Number.parseInt(value, 10);
  }

  return value;
}

function castParameters(parameters, openApiParameterDefinitions, scope) {
  const copy = { ...parameters };

  for (const definition of openApiParameterDefinitions.filter(
    (item) => item.in === scope
  )) {
    copy[definition.name] = castParameter(
      copy[definition.name],
      definition.schema
    );
  }

  return copy;
}

export class Registry {
  modules = {};

  moduleTree = {
    children: {},
  };

  add(url, module) {
    let node = this.moduleTree;

    for (const segment of url.split("/").slice(1)) {
      node.children ??= {};
      node.children[segment] ??= {};
      node = node.children[segment];
    }

    node.module = module;
  }

  remove(url) {
    let node = this.moduleTree;

    for (const segment of url.split("/").slice(1)) {
      node = node?.children?.[segment];

      if (!node) {
        return false;
      }
    }

    delete node.module;

    return true;
  }

  exists(method, url) {
    return Boolean(this.handler(url)?.module?.[method]);
  }

  // eslint-disable-next-line max-statements
  handler(url) {
    let node = this.moduleTree;

    const path = {};

    const matchedParts = [""];

    for (const segment of url.split("/").slice(1)) {
      if (node.children[segment]) {
        node = node.children[segment];
        matchedParts.push(segment);
      } else {
        const dynamicSegment = Object.keys(node.children).find(
          (ds) => ds.startsWith("{") && ds.endsWith("}")
        );

        if (dynamicSegment) {
          const variableName = dynamicSegment.slice(1, -1);

          path[variableName] = segment;

          node = node.children[dynamicSegment];

          matchedParts.push(dynamicSegment);
        }
      }
    }

    return { module: node.module, path, matchedPath: matchedParts.join("/") };
  }

  endpoint(httpRequestMethod, url, openApiParameterDefinitions = []) {
    const handler = this.handler(url);
    const execute = handler?.module?.[httpRequestMethod];

    if (!execute) {
      return () => ({
        status: 404,
        body: `Could not find a ${httpRequestMethod} method at ${url}\nGot as far as ${handler.matchedPath}`,
      });
    }

    return ({ ...requestData }) =>
      execute({
        ...requestData,

        header: castParameters(
          requestData.query,
          openApiParameterDefinitions,
          "header"
        ),

        query: castParameters(
          requestData.query,
          openApiParameterDefinitions,
          "query"
        ),

        path: castParameters(handler.path, openApiParameterDefinitions, "path"),
        matchedPath: handler.matchedPath ?? "none",
      });
  }
}
