// 模块工厂,用来给Compilation创建单个模块资源
// 在创建Compilation时通过param注入
const NormalModule = require('./NormalModule')
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

        this.init()
    }

    init() {
        this.registSystemPlugins()
    }

    //todo  注册系统内置插件
    registSystemPlugins() {
        // beforeCreate


        // create
        new AddFileSuffixPlugin().run(this)
        new CheckFileSuffixPlugin().run(this)


        new LoadeFileSourcePlugin().run(this)
        new ResolveDependenciesPlugin().run(this)

        // 额外代码生成
        new ES5codeGeneratePlugin().run(this)
        new TraverseASTPlugin().run(this)


        new ModuleResultPlugin().run(this)
        // afterCreate

    }

    create(params) {

        const moduleParams = {
            filePath: params.absolutePath, // 模块路径   //todo LazySet改良
            dependencies: [],           // 依赖项
            loaders: this.config.rules,
            generator: this.getGenerator(),
            parser: this.getParser(),
            resolver: this.getResolver()
        }

        const normalModule = new NormalModule(moduleParams)


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
    createParser() { }
    getParser() { }
    createGenerator() { }
    getGenerator() { }
    createResolver() { }
    getResolver() {
        return this.resolverFactory
    }

}


module.exports = ModuleFactory