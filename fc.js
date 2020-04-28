"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { BasePlugin } = require("@midwayjs/fcli-command-core");
const { join } = require("path");
const { writeWrapper } = require("@midwayjs/serverless-spec-builder");
const { generateFunctionsSpecFile } = require("@midwayjs/serverless-spec-builder/fc");
class AliyunFCPlugin extends BasePlugin {
    constructor() {
        super(...arguments);
        this.provider = 'aliyun';
        this.servicePath = this.core.config.servicePath;
        this.midwayBuildPath = join(this.servicePath, '.serverless');
        this.hooks = {
            'package:generateSpec': async () => {
                this.core.cli.log('Generate spec file...');
                await generateFunctionsSpecFile(this.getSpecJson(), join(this.midwayBuildPath, 'template.yml'));
            },
            'package:generateEntry': async () => {
                this.core.cli.log('Generate entry file...');
                this.setGlobalDependencies('@midwayjs/serverless-fc-starter');
                writeWrapper({
                    baseDir: this.servicePath,
                    service: this.core.service,
                    distDir: this.midwayBuildPath,
                    starter: '@midwayjs/serverless-fc-starter'
                });
            },
        };
    }
    getSpecJson(coverOptions) {
        const service = this.core.service;
        if (coverOptions) {
            Object.keys(coverOptions).forEach((key) => {
                if (!service[key]) {
                    service[key] = {};
                }
                Object.assign(service[key], coverOptions[key]);
            });
        }
        return {
            custom: service.custom,
            service: service.service,
            provider: service.provider,
            functions: this.getNotIgnoreFunc(),
            resources: service.resources,
            package: service.package,
        };
    }
    // 获取没有忽略的方法（for 高密度部署）
    getNotIgnoreFunc() {
        const func = {};
        for (const funcName in this.core.service.functions) {
            const funcConf = this.core.service.functions[funcName];
            if (funcConf._ignore) {
                continue;
            }
            func[funcName] = funcConf;
        }
        return func;
    }
    // 设置全局依赖，在package的时候会读取
    setGlobalDependencies(name, version) {
        if (!this.core.service.globalDependencies) {
            this.core.service.globalDependencies = {};
        }
        this.core.service.globalDependencies[name] = version || '*';
    }
}
exports.AliyunFCPlugin = AliyunFCPlugin;