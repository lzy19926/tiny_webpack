// 模块工厂,用来给Compilation创建单个模块资源
// 在创建Compilation时通过param注入
const NormalModule = require('./NormalModule')
const JavascriptGenerator = require('./JavaScriptGenerator')
const { AsyncSeriesHook } = require('../lzy_tapable/lib/index')
const AddFileSuffixPlugin = require('../plugins/forModuleFactory/AddFileSuffixPlugin')
const LoadeFileSourcePlugin = require('../plugins/forModuleFactory/LoadeFileSourcePlugin')
const CheckFileSuffixPlugin = require('../plugins/forModuleFactory/CheckFileSuffixPlugin')
const ResolveDependenciesPlugin = require('../plugins/forModuleFactory/ResolveDependenciesPlugin')
const ModuleResultPlugin = require('../plugins/forModuleFactory/ModuleResultPlugin')
const ES5codeGeneratePlugin = require('../plugins/forModuleFactory/ES5codeGeneratePlugin')
const TraverseASTPlugin = require('../plugins/forModuleFactory/TraverseASTPlugin')


class ModuleFactory {
    constructor(resolverFactory, config) {

        this.hooks = {
            beforeCreate: new AsyncSeriesHook(),
            create: new AsyncSeriesHook(["normalModule"]),// 手动触发下个回调,支持异步的hook
            afterCreate: new AsyncSeriesHook()
        }

        this.config = config
        this.resolverFactory = resolverFactory
        this.setting = {}



        this.parserCache = new Map()
        this.generatorCache = new Map()

        this.init()
    }

    init() {
        this.registSystemPlugins()
    }

    //todo  注册系统内置插件
    registSystemPlugins() {
        // beforeCreate

        // JS生成部分
        new AddFileSuffixPlugin().run(this)
        new CheckFileSuffixPlugin().run(this)
        new LoadeFileSourcePlugin().run(this)

        // JS Parse部分
        new ResolveDependenciesPlugin().run(this)
        new ES5codeGeneratePlugin().run(this)
        new TraverseASTPlugin().run(this)

        new ModuleResultPlugin().run(this)
        // afterCreate

    }

    create(params) {

        const setting = {
            generator: {
                Type: "javascript",
                options: {}
            },
            parser: {
                Type: "javascript",
                options: {}
            },
            resolver: {
                Type: "async",
                options: {}
            },
        }

        const filePath = params.absolutePath  // 模块路径   //todo LazySet改良
        const dependencies = []    // 依赖项
        const loaders = this.config.rules // loaders

        const generator = this.getGenerator(
            setting.generator.Type,
            setting.generator.options
        )
        const parser = this.getParser(
            setting.parser.Type,
            setting.parser.options
        )
        const resolver = this.getResolver(
            setting.resolver.Type,
            setting.resolver.options
        )

        const normalModule = new NormalModule(
            Object.assign({}, {
                filePath,
                dependencies,
                loaders,
                generator,
                parser,
                resolver
            }))


        // 执行插件流转逻辑 
        this.hooks.beforeCreate.callAsync()
        this.hooks.create.call(normalModule)
        this.hooks.afterCreate.callAsync()


        // 读取流转结果,生成模块
        if (normalModule.isDone) {
            return normalModule
        }
        return
    }

    // 用于给module创建需要使用的各类组件
    createParser() {

    }
    getParser() {
        return new AssetParser()
    }

    createGenerator(type, options = {}) {
        return new JavascriptGenerator(type, options)
    }
    getGenerator(type, options = {}) {

        let cache = this.generatorCache
        if (!cache) {
            this.generatorCache = new Map()
        }

        let generator = cache.get(options);
        if (!generator) {
            generator = this.createGenerator(type, options)
        }

        return generator
    }

    // resolver的创建和缓存逻辑在resolverFactory中
    getResolver(type) {
        return this.resolverFactory.get(type)
    }

}


module.exports = ModuleFactory