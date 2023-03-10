import path from "path";
import mkdirp from "mkdirp";
import rmfr from "rmfr";

import BasePlugin from "../plugins/base.js";

export default class CommandInit extends BasePlugin {
  /** @param {import("../index.js").default} parent */
  constructor(parent) {
    super(parent);
    const { program } = this.parent;

    program
      .command("init")
      .description("initialize config and data")
      .option("-k, --clean", "delete any existing data")
      .option("-n, --name [name]", "client application name")
      .option("-w, --website [URL]", "client website URL")
      .option(
        "-u, --base-url [URL]",
        "server base URL",
        "https://mastodon.social"
      )
      // TODO: options for initial bot name & website?
      .action(this.runInit.bind(this));
  }

  async runInit({ clean = false, name, website, botPath, baseUrl }) {
    const { parent } = this;
    const { data } = parent;
    const { config } = parent.config;
    const log = this.parent.logger.log({ command: "init" });
    const dataPath = path.resolve(config.get("dataPath"));

    const initialConfig = {
      apiBaseUrl: baseUrl,
      botName: name,
      botWebsite: website,
      botPath,
    };

    if (clean) {
      log.debug("Deleting data path");
      await rmfr(dataPath);
    }

    log.debug("Creating data path");
    await mkdirp(dataPath);

    log.debug("Generating initial config");
    await data.saveJSON("config", initialConfig);

    log.info({ msg: "Initialized data", dataPath });
  }
}
