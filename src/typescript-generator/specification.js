// import { join } from "node:path";
import fs from "node:fs/promises";
import nodePath from "node:path";

import yaml from "js-yaml";

import { Requirement } from "./requirement.js";

export class Specification {
  constructor(basePath) {
    this.basePath = basePath;
    this.cache = new Map();
  }

  async requirementAt(url, fromUrl = "") {
    const [file, path] = url.split("#");

    const filePath = nodePath.join(fromUrl.split("#").at(0), file);
    const data = await this.loadFile(filePath);

    const rootRequirement = new Requirement(data, `${filePath}#`, this);

    return rootRequirement.select(path.slice(1));
  }

  async loadFile(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    if (!this.basePath) {
      throw new Error("Specification was constructed without a base path");
    }

    const source = await fs.readFile(
      nodePath.join(this.basePath, path),
      "utf8"
    );
    const data = await yaml.load(source);

    this.cache.set(path, data);

    return data;
  }
}
