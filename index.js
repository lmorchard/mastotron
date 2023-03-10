import fs from "fs/promises";

import { Command } from "commander";

import Events from "./plugins/events.js";
import ConfigPlugin from "./plugins/config.js";
import LoggerPlugin from "./plugins/logger.js";
import DataPlugin from "./plugins/data.js";
import ClientPlugin from "./plugins/client.js";
import BotPlugin from "./plugins/bot.js";
import CommandsIndexPlugin from "./commands/index.js";

import BasePlugin from "./plugins/base.js";
export { BasePlugin };

export default class Mastotron {
  static configSchema = {};

  constructor(options) {
    this.options = options;
    this.events = new Events();
    this.program = new Command();
    this.config = new ConfigPlugin(this);
    this.logger = new LoggerPlugin(this);
    this.data = new DataPlugin(this);
    this.client = new ClientPlugin(this);
    this.bot = new BotPlugin(this);
    this.commands = new CommandsIndexPlugin(this);

    this.config.extendSchema(this.constructor.configSchema);
    this.program.hook("preAction", this.preAction.bind(this));
  }

  async init() {
    const packageJsonFn = new URL("./package.json", import.meta.url);
    const packageJsonData = await fs.readFile(packageJsonFn);
    const packageJson = JSON.parse(packageJsonData);
    this.program.version(packageJson.version);
  }

  async run(argv = process.argv) {
    await this.init();
    await this.program.parseAsync(argv);
  }

  async preAction(command) {
  }

  async onStart() {
    const { config, logger } = this;
    const log = logger.log();
    log.trace({ msg: "onStart" });
    this.intervalTimer = setInterval(
      this.onInterval.bind(this),
      config.get("timerInterval")
    );
  }

  async onInterval() {
    const log = this.logger.log();
    log.trace({ msg: "onInterval" });
  }

  async onMentioned({ created_at, account, status }) {
    const log = this.logger.log();
    const { acct } = account;
    const { content } = status;
    log.info({ msg: "mentioned", created_at, acct, content });
  }

  async onFavorited({ created_at, account, status }) {
    const log = this.logger.log();
    const { acct } = account;
    const { content } = status;
    log.info({ msg: "favorited", created_at, acct, content });
  }

  async onBoosted({ created_at, account, status }) {
    const log = this.logger.log();
    const { acct } = account;
    const { content } = status;
    log.info({ msg: "boosted", created_at, acct, content });
  }

  async onFollowed({ created_at, account }) {
    const log = this.logger.log();
    const { acct } = account;
    log.info({ msg: "followed by", created_at, acct });
  }

  async onOther(type, payload) {
    const log = this.logger.log();
    log.debug({ msg: "unhandled type", type, payload });
  }
}
