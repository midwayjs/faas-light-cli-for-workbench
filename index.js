"use strict";
const { BaseCLI } = require("@midwayjs/fcli-command-core");
const plugins = {
    invoke: [
        { mod: '@midwayjs/fcli-plugin-invoke', name: 'FaaSInvokePlugin' },
        { mod: '@midwayjs/fcli-plugin-dev-pack', name: 'DevPackPlugin' },
    ],
    test: { mod: '@midwayjs/fcli-plugin-test', name: 'TestPlugin' },
    package: [
        { mod: '@midwayjs/fcli-plugin-package', name: 'PackagePlugin' },
        { mod: './fc.js', name: 'AliyunFCPlugin' },
    ]
};
class CLI extends BaseCLI {
    loadDefaultPlugin() {
        const command = this.commands && this.commands[0];
        // version not load plugin
        if (this.argv.v || this.argv.version) {
            return;
        }
        let needLoad = [];
        if (!this.argv.h && command) {
            if (plugins[command]) {
                needLoad = needLoad.concat(plugins[command]);
            }
        }
        else {
            // load all
            Object.keys(plugins).forEach((cmd) => {
                needLoad = needLoad.concat(plugins[cmd]);
            });
        }
        needLoad.forEach((pluginInfo) => {
            try {
                const mod = require(pluginInfo.mod);
                if (mod[pluginInfo.name]) {
                    this.core.addPlugin(mod[pluginInfo.name]);
                }
            }
            catch (e) { }
        });
    }
    async loadPlugins() {
        await this.loadDefaultOptions();
        await super.loadPlugins();
    }
    async loadDefaultOptions() {
        if (this.commands.length) {
            return;
        }
        if (this.argv.v || this.argv.version) {
            this.displayVersion();
        }
        else {
            // 默认没有command的时候展示帮助
            this.argv.h = true;
        }
    }
}
exports.CLI = CLI;