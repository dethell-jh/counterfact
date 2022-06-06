export class Registry {
  modules = {};

  moduleTree = {
    children: {},
  };

  store;

  constructor(store = {}) {
    this.store = store;
  }

  get modulesList() {
    return Object.keys(this.modules);
  }

  add(url, module) {
    this.modules[url] = module;

    let node = this.moduleTree;

    for (const segment of url.split("/").slice(1)) {
      node.children ??= {};
      node.children[segment] ??= {};
      node = node.children[segment];
    }

    node.module = module;
  }

  remove(url) {
    delete this.modules[url];
  }

  exists(method, url) {
    return Boolean(this.modules[url]?.[method]);
  }

  endpoint(httpRequestMethod, url) {
    const module = this.modules[url];
    const lambda = module?.[httpRequestMethod];

    if (!lambda) {
      throw new Error(
        `${httpRequestMethod} method for endpoint at "${url}" does not exist`
      );
    }

    return lambda;
  }
}
